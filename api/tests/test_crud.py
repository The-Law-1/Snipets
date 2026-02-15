import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db import Base
from models.user import User
from models.snippet import Snippet
from models.follow import Follow
from services.create_profile import CreateProfile as CreateProfileService
from services.save_snippet import SaveSnippet
from services.get_snippets import GetSnippets
from services.delete_snippet import DeleteSnippet
from services.search_users import SearchUsers
from services.follow_user import FollowUser
from domain.snippet import CreateSnippet


@pytest.fixture
def db():
    """Test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    yield session
    session.close()


class TestAuth:
    def test_create_profile(self, db):
        """Test creating a user profile."""
        service = CreateProfileService(db)
        user = service.create("user-123", "testuser")
        assert user.id == "user-123"
        assert user.username == "testuser"

    def test_create_profile_duplicate_username(self, db):
        """Test that duplicate usernames are rejected."""
        service = CreateProfileService(db)
        service.create("user-1", "testuser")
        with pytest.raises(ValueError, match="username_taken"):
            service.create("user-2", "testuser")

    def test_create_profile_user_exists(self, db):
        """Test that duplicate user IDs are rejected."""
        service = CreateProfileService(db)
        service.create("user-123", "testuser1")
        with pytest.raises(ValueError, match="profile_exists"):
            service.create("user-123", "testuser2")


class TestSnippets:
    def test_save_snippet(self, db):
        """Test saving a snippet."""
        # Create user first
        user = User(id="user-1", username="testuser")
        db.add(user)
        db.commit()

        # Save snippet
        create_snippet = CreateSnippet(
            text="Hello world",
            title="Test",
            url="https://example.com",
        )
        service = SaveSnippet(db)
        snippet = service.save(create_snippet, "user-1")
        assert snippet.text == "Hello world"
        assert snippet.title == "Test"
        assert snippet.user_id == "user-1"

    def test_get_snippets(self, db):
        """Test retrieving snippets."""
        user = User(id="user-1", username="testuser")
        db.add(user)
        db.commit()

        snippet = Snippet(
            text="Test snippet",
            title="Test",
            url="https://example.com",
            user_id="user-1",
        )
        db.add(snippet)
        db.commit()

        service = GetSnippets(db)
        snippets = service.get_all("user-1")
        assert len(snippets) == 1
        assert snippets[0].text == "Test snippet"

    def test_get_snippets_by_title(self, db):
        """Test filtering snippets by title."""
        user = User(id="user-1", username="testuser")
        db.add(user)
        db.commit()

        snippet1 = Snippet(
            text="Python tutorial",
            title="Python basics",
            url="https://python.org",
            user_id="user-1",
        )
        snippet2 = Snippet(
            text="JavaScript tutorial",
            title="JS guide",
            url="https://javascript.org",
            user_id="user-1",
        )
        db.add(snippet1)
        db.add(snippet2)
        db.commit()

        service = GetSnippets(db)
        results = service.get_by_title("user-1", "python")
        assert len(results) == 1
        assert results[0].title == "Python basics"

    def test_delete_snippet(self, db):
        """Test deleting a snippet."""
        user = User(id="user-1", username="testuser")
        db.add(user)
        db.commit()

        snippet = Snippet(
            text="Test",
            title="Test",
            url="https://example.com",
            user_id="user-1",
        )
        db.add(snippet)
        db.commit()

        service = DeleteSnippet(db)
        result = service.delete(snippet.id, "user-1")
        assert result is True

        # Verify deletion
        remaining = db.query(Snippet).filter(Snippet.user_id == "user-1").all()
        assert len(remaining) == 0

    def test_delete_snippet_not_owner(self, db):
        """Test that users cannot delete other users' snippets."""
        user1 = User(id="user-1", username="user1")
        user2 = User(id="user-2", username="user2")
        db.add(user1)
        db.add(user2)
        db.commit()

        snippet = Snippet(
            text="Test",
            title="Test",
            url="https://example.com",
            user_id="user-1",
        )
        db.add(snippet)
        db.commit()

        service = DeleteSnippet(db)
        result = service.delete(snippet.id, "user-2")
        assert result is False


class TestSocial:
    def test_search_users(self, db):
        """Test user search."""
        user1 = User(id="user-1", username="alice")
        user2 = User(id="user-2", username="bob")
        user3 = User(id="user-3", username="alicia")
        db.add_all([user1, user2, user3])
        db.commit()

        service = SearchUsers(db)
        results = service.search("ali")
        assert len(results) == 2
        usernames = {u.username for u in results}
        assert usernames == {"alice", "alicia"}

    def test_follow_user(self, db):
        """Test following a user."""
        user1 = User(id="user-1", username="alice")
        user2 = User(id="user-2", username="bob")
        db.add_all([user1, user2])
        db.commit()

        service = FollowUser(db)
        follow = service.follow("user-1", "bob")
        assert follow.follower_id == "user-1"
        assert follow.following_id == "user-2"

    def test_follow_user_not_found(self, db):
        """Test following non-existent user."""
        user = User(id="user-1", username="alice")
        db.add(user)
        db.commit()

        service = FollowUser(db)
        with pytest.raises(ValueError, match="user_not_found"):
            service.follow("user-1", "nonexistent")

    def test_follow_self(self, db):
        """Test that users cannot follow themselves."""
        user = User(id="user-1", username="alice")
        db.add(user)
        db.commit()

        service = FollowUser(db)
        with pytest.raises(ValueError, match="cannot_follow_self"):
            service.follow("user-1", "alice")
