import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash(process.env.ADMIN_PASSWORD ?? "changeme", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cheatsheet.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cheatsheet.dev",
      hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.category.deleteMany({
    where: { name: "Python", userId: admin.id },
  });

  const py = await prisma.category.create({
    data: {
      name: "Python",
      icon: "🐍",
      color: "green",
      description: "Python syntax, built-ins, data structures, file I/O, concurrency and tooling",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Data Structures ──────────────────────────────────────────────────
          {
            title: "Data Structures",
            description: "Lists, dicts, sets, tuples and common operations",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "List operations",
                  content: `nums = [3, 1, 4, 1, 5, 9]

nums.append(2)          # add to end
nums.extend([6, 5])     # merge another list
nums.insert(0, 0)       # insert at index
nums.remove(1)          # remove first occurrence
nums.pop()              # remove & return last item
nums.pop(0)             # remove & return at index
nums.sort()             # sort in-place
nums.sort(reverse=True)
sorted_copy = sorted(nums)
nums.reverse()
idx = nums.index(5)     # first index of value
count = nums.count(1)   # occurrences
nums2 = nums[:]         # shallow copy
sliced = nums[1:4]      # slice [start:stop]
sliced = nums[::2]      # every 2nd element`,
                },
                {
                  order: 1, language: "python", label: "Dict operations",
                  content: `user = {"name": "Alice", "age": 30}

user["email"] = "alice@example.com"   # add/update
user.get("missing", "default")        # safe get
user.setdefault("role", "user")       # set if absent
user.update({"age": 31, "city": "NY"})
user.pop("city")                      # remove key
"name" in user                        # key existence check

# Iterate
for key, value in user.items(): ...
for key in user.keys(): ...
for value in user.values(): ...

# Merge (Python 3.9+)
merged = user | {"extra": True}

# Dict comprehension
squares = {n: n**2 for n in range(10)}`,
                },
                {
                  order: 2, language: "python", label: "Sets",
                  content: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

a.add(7)
a.discard(99)          # remove if present, no error
a.remove(1)            # remove or raise KeyError

a | b                  # union        {1,2,3,4,5,6}
a & b                  # intersection {3,4}
a - b                  # difference   {1,2}
a ^ b                  # symmetric diff {1,2,5,6}

a.issubset(b)
a.issuperset(b)
a.isdisjoint(b)        # True if no common elements

# Deduplicate a list
unique = list(set([1, 2, 2, 3, 3]))`,
                },
                {
                  order: 3, language: "python", label: "Collections module",
                  content: `from collections import Counter, defaultdict, deque, OrderedDict

# Counter — frequency map
words = ["apple", "banana", "apple", "cherry"]
c = Counter(words)
c.most_common(2)       # [('apple', 2), ('banana', 1)]
c["apple"]             # 2

# defaultdict — no KeyError on missing keys
graph = defaultdict(list)
graph["a"].append("b")

# deque — O(1) append/pop from both ends
dq = deque([1, 2, 3], maxlen=5)
dq.appendleft(0)
dq.popleft()
dq.rotate(1)

# namedtuple
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
p.x, p.y`,
                },
              ],
            },
          },
          // ── Comprehensions & Itertools ────────────────────────────────────────
          {
            title: "Comprehensions & Itertools",
            description: "Concise data transformations and lazy iteration",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "List, dict and set comprehensions",
                  content: `# List comprehension
squares = [x**2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]

# Nested
matrix = [[1,2,3],[4,5,6]]
flat   = [n for row in matrix for n in row]

# Dict comprehension
inv    = {v: k for k, v in {"a": 1, "b": 2}.items()}

# Set comprehension
unique_lens = {len(w) for w in ["hi", "hello", "hey"]}

# Generator expression (lazy, memory-efficient)
total = sum(x**2 for x in range(1_000_000))`,
                },
                {
                  order: 1, language: "python", label: "itertools essentials",
                  content: `import itertools

# Chaining and slicing
itertools.chain([1,2], [3,4])          # 1 2 3 4
itertools.islice(range(100), 5, 15)    # items 5-14

# Grouping
data = [("a",1),("a",2),("b",3)]
for key, group in itertools.groupby(data, key=lambda x: x[0]):
    print(key, list(group))

# Combinatorics
list(itertools.combinations("ABC", 2))   # [('A','B'),('A','C'),('B','C')]
list(itertools.permutations("AB", 2))    # [('A','B'),('B','A')]
list(itertools.product([0,1], repeat=3)) # all 3-bit combos

# Accumulate
list(itertools.accumulate([1,2,3,4]))    # [1, 3, 6, 10]

# Cycle and repeat
itertools.cycle([1,2,3])       # infinite 1 2 3 1 2 3 ...
itertools.repeat(0, times=5)   # [0, 0, 0, 0, 0]`,
                },
                {
                  order: 2, language: "python", label: "functools essentials",
                  content: `from functools import reduce, lru_cache, partial, wraps

# lru_cache — memoize expensive calls
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)

fib.cache_info()   # hits, misses, size

# reduce
total = reduce(lambda acc, x: acc + x, [1,2,3,4], 0)

# partial — pre-fill arguments
from functools import partial
double = partial(pow, exp=2)
double(5)  # 25 (but note: positional only works differently)

add5 = partial(lambda x, y: x + y, 5)
add5(3)    # 8

# wraps — preserve metadata in decorators
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper`,
                },
              ],
            },
          },
          // ── Functions & Decorators ────────────────────────────────────────────
          {
            title: "Functions & Decorators",
            description: "Args, kwargs, closures, decorators and type hints",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Args, kwargs and keyword-only",
                  content: `def func(pos1, pos2, /, normal, *, kw_only, **kwargs):
    """
    pos1, pos2  — positional-only (before /)
    normal      — positional or keyword
    kw_only     — keyword-only (after *)
    kwargs      — extra keyword arguments
    """
    print(pos1, pos2, normal, kw_only, kwargs)

func(1, 2, "a", kw_only="b", extra=True)

# Unpacking
def add(a, b, c): return a + b + c
args   = [1, 2, 3]
kwargs = {"a": 1, "b": 2, "c": 3}
add(*args)
add(**kwargs)`,
                },
                {
                  order: 1, language: "python", label: "Decorators",
                  content: `import time
from functools import wraps

# Timing decorator
def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

# Decorator with arguments
def retry(times=3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == times - 1:
                        raise
            return None
        return wrapper
    return decorator

@timer
@retry(times=3)
def fetch_data(url: str) -> dict:
    ...`,
                },
                {
                  order: 2, language: "python", label: "Type hints and dataclasses",
                  content: `from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional

@dataclass
class User:
    name: str
    email: str
    age: int = 0
    tags: list[str] = field(default_factory=list)
    _id: str = field(init=False, repr=False)

    def __post_init__(self):
        self._id = self.email.lower()

    def is_adult(self) -> bool:
        return self.age >= 18

# Frozen (immutable) dataclass
@dataclass(frozen=True)
class Point:
    x: float
    y: float

# Common type hints
def process(
    items: list[int],
    mapping: dict[str, int],
    opt: Optional[str] = None,
) -> tuple[int, ...]:
    ...`,
                },
              ],
            },
          },
          // ── OOP ──────────────────────────────────────────────────────────────
          {
            title: "OOP & Classes",
            description: "Classes, inheritance, dunder methods and protocols",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Class with dunder methods",
                  content: `class Vector:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self) -> str:
        return f"Vector({self.x}, {self.y})"

    def __str__(self) -> str:
        return f"({self.x}, {self.y})"

    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, scalar: float) -> "Vector":
        return Vector(self.x * scalar, self.y * scalar)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __len__(self) -> int:
        return 2

    def __iter__(self):
        yield self.x
        yield self.y`,
                },
                {
                  order: 1, language: "python", label: "Inheritance and super()",
                  content: `class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        raise NotImplementedError

class Dog(Animal):
    def __init__(self, name: str, breed: str):
        super().__init__(name)
        self.breed = breed

    def speak(self) -> str:
        return f"{self.name} says Woof!"

# Multiple inheritance with MRO
class A:
    def method(self): return "A"

class B(A):
    def method(self): return "B -> " + super().method()

class C(A):
    def method(self): return "C -> " + super().method()

class D(B, C):
    pass

D().method()   # "B -> C -> A"
D.__mro__      # MRO resolution order`,
                },
                {
                  order: 2, language: "python", label: "Properties, class and static methods",
                  content: `class Temperature:
    def __init__(self, celsius: float = 0):
        self._celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9/5 + 32

    @classmethod
    def from_fahrenheit(cls, f: float) -> "Temperature":
        return cls((f - 32) * 5/9)

    @staticmethod
    def absolute_zero() -> float:
        return -273.15

t = Temperature.from_fahrenheit(212)
t.celsius   # 100.0`,
                },
                {
                  order: 3, language: "python", label: "Abstract base classes and protocols",
                  content: `from abc import ABC, abstractmethod
from typing import Protocol, runtime_checkable

# Abstract base class
class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

class Circle(Shape):
    def __init__(self, r: float):
        self.r = r
    def area(self) -> float:
        return 3.14159 * self.r ** 2
    def perimeter(self) -> float:
        return 2 * 3.14159 * self.r

# Protocol (structural subtyping — duck typing with types)
@runtime_checkable
class Drawable(Protocol):
    def draw(self) -> None: ...

class Canvas:
    def draw(self) -> None:
        print("drawing")

isinstance(Canvas(), Drawable)  # True`,
                },
              ],
            },
          },
          // ── Error Handling ────────────────────────────────────────────────────
          {
            title: "Error Handling",
            description: "try/except patterns, custom exceptions and context managers",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Exception handling patterns",
                  content: `# Catch specific exceptions
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Math error: {e}")
except (TypeError, ValueError) as e:
    print(f"Type/Value error: {e}")
except Exception as e:
    raise RuntimeError("Unexpected error") from e
else:
    print("No exception, result:", result)
finally:
    print("Always runs")

# Re-raise with context
try:
    open("missing.txt")
except FileNotFoundError as e:
    raise SystemExit(f"Config file missing: {e}") from e

# Exception groups (Python 3.11+)
try:
    raise ExceptionGroup("multiple", [ValueError("v"), TypeError("t")])
except* ValueError as eg:
    print("Caught ValueErrors:", eg.exceptions)`,
                },
                {
                  order: 1, language: "python", label: "Custom exceptions",
                  content: `class AppError(Exception):
    """Base class for application errors."""

class ValidationError(AppError):
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"[{field}] {message}")

class NotFoundError(AppError):
    def __init__(self, resource: str, id: int | str):
        super().__init__(f"{resource} with id={id!r} not found")
        self.resource = resource
        self.id = id

# Usage
try:
    raise ValidationError("email", "must contain @")
except ValidationError as e:
    print(e.field, e.message)`,
                },
                {
                  order: 2, language: "python", label: "Context managers",
                  content: `# Class-based context manager
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        return False  # don't suppress exceptions

with Timer() as t:
    sum(range(1_000_000))
print(f"Elapsed: {t.elapsed:.4f}s")

# Generator-based with contextlib
from contextlib import contextmanager

@contextmanager
def managed_resource(name: str):
    print(f"Acquiring {name}")
    try:
        yield name
    finally:
        print(f"Releasing {name}")

with managed_resource("db_connection") as res:
    print(f"Using {res}")

# Suppress specific exceptions
from contextlib import suppress
with suppress(FileNotFoundError):
    open("maybe_missing.txt")`,
                },
              ],
            },
          },
          // ── File I/O ──────────────────────────────────────────────────────────
          {
            title: "File I/O & Paths",
            description: "Read, write and navigate files with pathlib and built-ins",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "pathlib — modern file paths",
                  content: `from pathlib import Path

p = Path("/etc/app/config.toml")

p.exists()          # True/False
p.is_file()
p.is_dir()
p.suffix            # '.toml'
p.stem              # 'config'
p.name              # 'config.toml'
p.parent            # Path('/etc/app')

# Build paths
base = Path.home() / ".config" / "app"
base.mkdir(parents=True, exist_ok=True)

# Glob
list(Path(".").glob("**/*.py"))
list(Path(".").rglob("*.log"))

# Read / write text
text = p.read_text(encoding="utf-8")
p.write_text("hello", encoding="utf-8")

# Read / write bytes
data = p.read_bytes()
p.write_bytes(b"\\x00\\x01")

# Iterate directory
for child in Path(".").iterdir():
    print(child.name)`,
                },
                {
                  order: 1, language: "python", label: "Reading and writing files",
                  content: `# Read entire file
with open("data.txt", encoding="utf-8") as f:
    content = f.read()

# Read line by line (memory-efficient)
with open("big.log", encoding="utf-8") as f:
    for line in f:
        process(line.rstrip())

# Write / append
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("line one\\n")
    f.writelines(["line two\\n", "line three\\n"])

with open("out.txt", "a") as f:
    f.write("appended\\n")

# JSON
import json
with open("data.json") as f:
    data = json.load(f)

with open("out.json", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# CSV
import csv
with open("data.csv", newline="") as f:
    reader = csv.DictReader(f)
    rows = list(reader)`,
                },
                {
                  order: 2, language: "python", label: "TOML, YAML and environment variables",
                  content: `# TOML (Python 3.11+ built-in)
import tomllib
with open("pyproject.toml", "rb") as f:
    config = tomllib.load(f)

# YAML (pip install pyyaml)
import yaml
with open("config.yml") as f:
    cfg = yaml.safe_load(f)

# Environment variables
import os
from dotenv import load_dotenv   # pip install python-dotenv

load_dotenv()                    # loads .env file

db_url  = os.environ["DATABASE_URL"]          # raises if missing
debug   = os.getenv("DEBUG", "false").lower() == "true"
port    = int(os.getenv("PORT", "8080"))`,
                },
              ],
            },
          },
          // ── Concurrency ───────────────────────────────────────────────────────
          {
            title: "Concurrency",
            description: "asyncio, threading, multiprocessing and concurrent.futures",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "asyncio basics",
                  content: `import asyncio
import httpx   # pip install httpx

async def fetch(url: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        return resp.text

async def main():
    urls = [
        "https://api.example.com/1",
        "https://api.example.com/2",
    ]
    # Run concurrently, gather results
    results = await asyncio.gather(*[fetch(u) for u in urls])

    # With error handling
    results = await asyncio.gather(*[fetch(u) for u in urls], return_exceptions=True)

    # Limit concurrency with Semaphore
    sem = asyncio.Semaphore(10)
    async def bounded_fetch(url):
        async with sem:
            return await fetch(url)

    await asyncio.gather(*[bounded_fetch(u) for u in urls])

asyncio.run(main())`,
                },
                {
                  order: 1, language: "python", label: "async generators and context managers",
                  content: `import asyncio
from contextlib import asynccontextmanager

# Async generator
async def paginate(endpoint: str):
    page = 1
    while True:
        data = await fetch(f"{endpoint}?page={page}")
        if not data:
            break
        yield data
        page += 1

async def collect():
    async for page in paginate("/api/items"):
        process(page)

# Async context manager
@asynccontextmanager
async def db_connection(url: str):
    conn = await connect(url)
    try:
        yield conn
    finally:
        await conn.close()

async def main():
    async with db_connection("postgres://...") as db:
        result = await db.fetch("SELECT 1")`,
                },
                {
                  order: 2, language: "python", label: "concurrent.futures — threads and processes",
                  content: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed

# I/O-bound work → threads
def download(url: str) -> bytes:
    import urllib.request
    with urllib.request.urlopen(url) as r:
        return r.read()

with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(download, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        try:
            data = future.result()
        except Exception as e:
            print(f"{url} failed: {e}")

# CPU-bound work → processes
def crunch(n: int) -> int:
    return sum(i**2 for i in range(n))

with ProcessPoolExecutor() as pool:
    results = list(pool.map(crunch, [10**6, 10**6, 10**6]))`,
                },
              ],
            },
          },
          // ── Testing ───────────────────────────────────────────────────────────
          {
            title: "Testing with pytest",
            description: "Fixtures, parametrize, mocking and coverage",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "pytest CLI",
                  content: `pytest                          # run all tests
pytest tests/test_user.py       # run single file
pytest -k "auth or login"       # filter by name pattern
pytest -m slow                  # run marked tests
pytest -x                       # stop on first failure
pytest -v                       # verbose output
pytest -s                       # show print statements
pytest --tb=short               # shorter tracebacks
pytest --cov=src --cov-report=html  # coverage report`,
                },
                {
                  order: 1, language: "python", label: "Fixtures and parametrize",
                  content: `import pytest

# Fixture
@pytest.fixture
def db_session():
    session = create_test_session()
    yield session
    session.rollback()
    session.close()

# Fixture scopes: function (default), class, module, session
@pytest.fixture(scope="module")
def api_client():
    client = TestClient(app)
    yield client

# Parametrize
@pytest.mark.parametrize("email,valid", [
    ("user@example.com", True),
    ("not-an-email",     False),
    ("",                 False),
    ("a@b.c",            True),
])
def test_email_validation(email: str, valid: bool):
    assert validate_email(email) == valid

# Using fixtures in tests
def test_create_user(db_session):
    user = User(name="Alice", email="alice@example.com")
    db_session.add(user)
    db_session.commit()
    assert user.id is not None`,
                },
                {
                  order: 2, language: "python", label: "Mocking with unittest.mock",
                  content: `from unittest.mock import patch, MagicMock, AsyncMock
import pytest

# Patch a function
def test_send_email():
    with patch("myapp.email.smtp_send") as mock_send:
        mock_send.return_value = True
        result = send_welcome_email("user@example.com")
        assert result is True
        mock_send.assert_called_once_with(
            to="user@example.com",
            subject="Welcome!",
        )

# Patch as decorator
@patch("myapp.services.requests.get")
def test_fetch_user(mock_get):
    mock_get.return_value.json.return_value = {"id": 1, "name": "Alice"}
    mock_get.return_value.status_code = 200
    user = fetch_user(1)
    assert user["name"] == "Alice"

# Mock async function
@pytest.mark.asyncio
async def test_async_service():
    with patch("myapp.service.fetch", new_callable=AsyncMock) as mock:
        mock.return_value = {"data": 42}
        result = await process()
        assert result == 42`,
                },
              ],
            },
          },
          // ── Tooling & Packaging ───────────────────────────────────────────────
          {
            title: "Tooling & Packaging",
            description: "uv, pip, venv, pyproject.toml and linting",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "uv — fast package manager",
                  content: `# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

uv init myproject           # new project with pyproject.toml
uv venv                     # create .venv
uv add requests             # add dependency
uv add pytest --dev         # add dev dependency
uv remove requests          # remove dependency
uv sync                     # install all deps from lockfile
uv run pytest               # run command in project env
uv pip install -r requirements.txt  # install from requirements
uv lock                     # update lockfile
uv tree                     # show dependency tree`,
                },
                {
                  order: 1, language: "bash", label: "pip & venv",
                  content: `# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate       # Linux/macOS
.venv\\Scripts\\activate          # Windows

# Install packages
pip install requests
pip install -r requirements.txt
pip install -e .                # editable install (for dev)

# Freeze and export
pip freeze > requirements.txt
pip list --outdated

# Upgrade packages
pip install --upgrade pip
pip install --upgrade requests

# Uninstall
pip uninstall requests -y`,
                },
                {
                  order: 2, language: "toml", label: "pyproject.toml",
                  content: `[project]
name = "myapp"
version = "0.1.0"
description = "My Python application"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio",
    "pytest-cov",
    "ruff",
    "mypy",
]

[project.scripts]
myapp = "myapp.cli:main"

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "UP"]

[tool.mypy]
strict = true
python_version = "3.11"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]`,
                },
                {
                  order: 3, language: "bash", label: "ruff — fast linter and formatter",
                  content: `# Install
pip install ruff

# Lint
ruff check .                    # check all files
ruff check src/                 # check directory
ruff check --fix .              # auto-fix safe issues

# Format
ruff format .                   # format all files
ruff format --check .           # check without changing

# Common rule sets
# E/W — pycodestyle, F — pyflakes, I — isort
# UP — pyupgrade, B — flake8-bugbear, S — bandit (security)`,
                },
              ],
            },
          },
          // ── Useful Built-ins & Snippets ───────────────────────────────────────
          {
            title: "Useful Built-ins & Snippets",
            description: "Handy one-liners and patterns that come up constantly",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "String formatting and manipulation",
                  content: `name, age, pi = "Alice", 30, 3.14159

# f-strings (preferred)
f"Hello, {name}! Age: {age}"
f"Pi is approximately {pi:.2f}"
f"{age:05d}"          # zero-padded: 00030
f"{1_000_000:,}"      # thousands sep: 1,000,000
f"{'left':<10}"       # left-align in 10 chars
f"{'right':>10}"      # right-align
f"{name!r}"           # repr: 'Alice'
f"{name!u}"           # not valid — use .upper() instead

# Common methods
"  hello  ".strip()          # 'hello'
"hello world".split()        # ['hello', 'world']
",".join(["a", "b", "c"])    # 'a,b,c'
"hello".startswith("hel")    # True
"HELLO".lower()              # 'hello'
"hello world".title()        # 'Hello World'
"hello".replace("l", "r")   # 'herro'
"abc" * 3                    # 'abcabcabc'`,
                },
                {
                  order: 1, language: "python", label: "Useful built-in functions",
                  content: `# zip and enumerate
names  = ["Alice", "Bob", "Carol"]
scores = [95, 87, 92]

for i, name in enumerate(names, start=1):
    print(f"{i}. {name}")

for name, score in zip(names, scores):
    print(f"{name}: {score}")

# zip_longest (pad shorter iterables)
from itertools import zip_longest
list(zip_longest([1,2,3], [4,5], fillvalue=0))

# map, filter
doubled = list(map(lambda x: x*2, [1,2,3]))
evens   = list(filter(lambda x: x%2==0, range(10)))

# any, all
any(x > 5 for x in [1,3,7,2])  # True
all(x > 0 for x in [1,3,7,2])  # True

# min, max with key
words = ["banana", "apple", "cherry"]
min(words, key=len)            # 'apple'
max(words, key=len)            # 'banana'
sorted(words, key=str.lower)

# vars, dir, type, isinstance
isinstance(42, (int, float))   # True
type(42).__name__              # 'int'`,
                },
                {
                  order: 2, language: "python", label: "Datetime and time",
                  content: `from datetime import datetime, date, timedelta, timezone

now    = datetime.now()
utcnow = datetime.now(tz=timezone.utc)
today  = date.today()

# Format and parse
iso    = now.isoformat()                         # '2025-04-14T12:00:00'
fmt    = now.strftime("%Y-%m-%d %H:%M:%S")
parsed = datetime.strptime("2025-01-15", "%Y-%m-%d")

# Arithmetic
tomorrow   = today + timedelta(days=1)
next_week  = now + timedelta(weeks=1)
diff       = datetime(2025,12,31) - now
diff.days

# Timestamps
ts  = now.timestamp()           # float Unix timestamp
dt  = datetime.fromtimestamp(ts, tz=timezone.utc)

# Comparison
datetime(2025,1,1) < datetime(2025,6,1)   # True`,
                },
                {
                  order: 3, language: "python", label: "Walrus operator, match and other modern syntax",
                  content: `# Walrus operator := (Python 3.8+)
import re
if m := re.search(r"\\d+", "abc123def"):
    print(m.group())   # '123'

while chunk := f.read(8192):
    process(chunk)

# Structural pattern matching (Python 3.10+)
command = ("move", 10, 20)

match command:
    case ("quit",):
        quit()
    case ("move", x, y):
        move(x, y)
    case ("say", message) if message:
        print(message)
    case _:
        print("unknown command")

# Match with class patterns
match response:
    case {"status": 200, "data": data}:
        return data
    case {"status": 404}:
        raise NotFoundError()
    case {"status": int(code)}:
        raise HTTPError(code)`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Python cheatsheet: ${py.name} (${py.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
