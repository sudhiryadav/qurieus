from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime, Text, ARRAY, Enum, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid
import enum

class SubscriptionType(enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"

class PlanType(enum.Enum):
    basic = "basic"
    pro = "pro"
    enterprise = "enterprise"

Base = declarative_base()

class Users(Base):
    __tablename__ = "Users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    emailVerified = Column(DateTime)
    image = Column(String)
    password = Column(String, nullable=False)
    passwordResetToken = Column(String, unique=True)
    passwordResetTokenExp = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Profile fields
    company = Column(String, nullable=False)
    plan = Column(Enum(PlanType), nullable=False)
    subscription_type = Column(Enum(SubscriptionType), nullable=False)
    subscription_start_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    subscription_end_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    chatMessages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    embeddings = relationship("Embedding", back_populates="user", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "Account"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    providerAccountId = Column(String, nullable=False)
    refresh_token = Column(Text)
    access_token = Column(Text)
    expires_at = Column(Integer)
    token_type = Column(String)
    scope = Column(String)
    id_token = Column(Text)
    session_state = Column(String)
    
    user = relationship("Users", back_populates="accounts")
    
    __table_args__ = (
        UniqueConstraint('provider', 'providerAccountId', name='uq_provider_account'),
    )

class Session(Base):
    __tablename__ = "Session"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sessionToken = Column(String, unique=True, nullable=False)
    userId = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    expires = Column(DateTime, nullable=False)
    
    user = relationship("Users", back_populates="sessions")

class VerificationToken(Base):
    __tablename__ = "VerificationToken"
    
    identifier = Column(String, primary_key=True)
    token = Column(String, unique=True, nullable=False)
    expires = Column(DateTime, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('identifier', 'token', name='uq_identifier_token'),
    )

class SubscriptionPlan(Base):
    __tablename__ = "SubscriptionPlan"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    features = Column(ARRAY(String))
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "Subscription"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("Users.id"), unique=True, nullable=False)
    planId = Column(String, ForeignKey("SubscriptionPlan.id"), nullable=False)
    razorpaySubscriptionId = Column(String, unique=True, nullable=False)
    razorpayCustomerId = Column(String, nullable=False)
    status = Column(String, nullable=False)
    currentPeriodStart = Column(DateTime, nullable=False)
    currentPeriodEnd = Column(DateTime, nullable=False)
    cancelledAt = Column(DateTime)
    lastPaymentId = Column(String)
    lastPaymentAmount = Column(Float)
    lastPaymentDate = Column(DateTime)
    lastPaymentError = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("Users", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")

class Message(Base):
    __tablename__ = "Message"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(Text, nullable=False)
    role = Column(String, nullable=False)  # "user" or "assistant"
    createdAt = Column(DateTime, default=datetime.utcnow)
    userId = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    
    user = relationship("Users", back_populates="messages")

class ContactMessage(Base):
    __tablename__ = "ContactMessage"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fullName = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "ChatMessage"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(Text, nullable=False)
    role = Column(String, nullable=False)  # "user" or "assistant"
    userId = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    ipAddress = Column(String)
    keywords = Column(String)  # Comma-separated list of keywords
    responseTime = Column(Float)  # Time in seconds for assistant response
    createdAt = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("Users", back_populates="chatMessages")

class Document(Base):
    __tablename__ = "Document"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fileName = Column(String, nullable=False)
    originalName = Column(String, nullable=False)
    fileType = Column(String, nullable=False)
    fileSize = Column(Integer, nullable=False)
    category = Column(String)
    description = Column(Text)
    content = Column(Text, nullable=False)
    keywords = Column(String)  # Comma-separated list of keywords
    uploadedAt = Column(DateTime, default=datetime.utcnow)
    userId = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    
    user = relationship("Users", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "DocumentChunk"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    documentId = Column(String, ForeignKey("Document.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    chunkIndex = Column(Integer, nullable=False)
    
    document = relationship("Document", back_populates="chunks")
    embedding = relationship("Embedding", back_populates="chunk", uselist=False)

class Embedding(Base):
    __tablename__ = "Embedding"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=False)
    chunkId = Column(String, ForeignKey("DocumentChunk.id", ondelete="CASCADE"), unique=True, nullable=False)
    vector = Column(ARRAY(Float))
    createdAt = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("Users", back_populates="embeddings")
    chunk = relationship("DocumentChunk", back_populates="embedding") 