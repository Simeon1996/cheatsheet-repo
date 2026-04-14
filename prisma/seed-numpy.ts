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
    },
  });

  await prisma.category.deleteMany({
    where: { name: "NumPy", userId: admin.id },
  });

  const numpy = await prisma.category.create({
    data: {
      name: "NumPy",
      icon: "🔢",
      color: "blue",
      description: "NumPy array creation, indexing, reshaping, broadcasting, math operations, linear algebra, random numbers, and performance patterns",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Array Creation ────────────────────────────────────────────────
          {
            title: "Array Creation",
            description: "Create arrays from lists, ranges, constants, random data, and structured types",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "From data",
                  content: `import numpy as np

# From Python list
a = np.array([1, 2, 3])
b = np.array([[1, 2], [3, 4]], dtype=float)

# Explicit dtype
np.array([1, 2, 3], dtype=np.int32)
np.array([1.5, 2.5], dtype=np.float64)
np.array([1+2j, 3+4j], dtype=complex)

# From range
np.arange(10)              # [0 1 2 ... 9]
np.arange(2, 20, 3)        # start, stop, step
np.linspace(0, 1, 5)       # 5 evenly spaced points [0, 0.25, 0.5, 0.75, 1]
np.logspace(0, 3, 4)       # [1, 10, 100, 1000] (log-spaced)
np.geomspace(1, 1000, 4)   # geometric spacing`,
                },
                {
                  order: 1, language: "python", label: "Constant & structured arrays",
                  content: `np.zeros((3, 4))             # 3×4 array of 0.0
np.ones((2, 3, 4))          # 3D array of 1.0
np.full((3, 3), 7)          # filled with 7
np.empty((2, 2))            # uninitialized (fast)
np.eye(4)                   # 4×4 identity matrix
np.diag([1, 2, 3])          # diagonal matrix
np.diag(a)                  # extract diagonal of 2D array
np.tri(3)                   # lower-triangle of ones

# Like another array (same shape & dtype)
np.zeros_like(a)
np.ones_like(a)
np.full_like(a, fill_value=99)
np.empty_like(a)

# From function
np.fromfunction(lambda i, j: i + j, (3, 3))
np.fromiter((x**2 for x in range(5)), dtype=int)`,
                },
                {
                  order: 2, language: "python", label: "Random arrays",
                  content: `rng = np.random.default_rng(seed=42)   # modern API (preferred)

rng.random((3, 4))          # uniform [0, 1)
rng.integers(0, 10, (3, 3)) # random ints [0, 10)
rng.normal(0, 1, (3, 3))    # standard normal
rng.standard_normal((5,))
rng.uniform(low=-1, high=1, size=(4, 4))
rng.choice([10, 20, 30], size=5)
rng.choice(a, size=3, replace=False)  # without replacement
rng.shuffle(a)              # in-place shuffle
rng.permutation(10)         # shuffled arange(10)

# Legacy API (still common)
np.random.seed(0)
np.random.rand(3, 3)        # uniform [0, 1)
np.random.randn(3, 3)       # standard normal`,
                },
              ],
            },
          },
          // ── Array Attributes & Inspection ────────────────────────────────
          {
            title: "Array Attributes & Inspection",
            description: "Shape, dtype, strides, memory layout, and type casting",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Attributes",
                  content: `a = np.array([[1, 2, 3], [4, 5, 6]])

a.shape        # (2, 3)
a.ndim         # 2
a.size         # 6  (total elements)
a.dtype        # dtype('int64')
a.itemsize     # bytes per element
a.nbytes       # total bytes
a.strides      # bytes between elements along each axis
a.flags        # C-contiguous, Fortran-contiguous, writeable...

# Type casting
a.astype(float)
a.astype(np.float32)     # saves memory vs float64
a.view(np.uint8)         # reinterpret bytes`,
                },
                {
                  order: 1, language: "python", label: "Useful dtypes",
                  content: `# Integer
np.int8, np.int16, np.int32, np.int64
np.uint8, np.uint16, np.uint32, np.uint64

# Float
np.float16, np.float32, np.float64   # float64 = Python float
np.complex64, np.complex128

# Other
np.bool_
np.str_
np.object_

# Structured array
dt = np.dtype([("name", "U10"), ("age", np.int32), ("score", np.float64)])
rec = np.array([("Alice", 25, 88.5), ("Bob", 30, 92.0)], dtype=dt)
rec["name"]       # array of names
rec["score"]`,
                },
              ],
            },
          },
          // ── Indexing & Slicing ────────────────────────────────────────────
          {
            title: "Indexing & Slicing",
            description: "Basic slicing, fancy indexing, boolean masks, and np.newaxis",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Basic indexing & slicing",
                  content: `a = np.arange(24).reshape(4, 6)

a[0]             # first row
a[-1]            # last row
a[0, 2]          # row 0, col 2
a[1:3]           # rows 1 and 2
a[:, 2]          # all rows, col 2
a[1:3, 2:5]      # sub-matrix
a[::2, ::2]      # every other row and col
a[::-1]          # reversed rows

# 3D array
b = np.arange(60).reshape(3, 4, 5)
b[0]             # first 2D slice
b[0, :, 2]       # 0th block, all rows, col 2
b[..., 2]        # col 2 across all dims (Ellipsis)`,
                },
                {
                  order: 1, language: "python", label: "Fancy indexing & boolean masks",
                  content: `a = np.array([10, 20, 30, 40, 50])

# Index array
idx = [0, 2, 4]
a[idx]           # [10 30 50]

# Boolean mask
mask = a > 25
a[mask]          # [30 40 50]
a[a > 25]        # same, inline

# 2D fancy indexing
m = np.arange(12).reshape(3, 4)
rows = [0, 2]
cols = [1, 3]
m[rows, cols]    # [m[0,1], m[2,3]] = [1, 11]

# np.where — conditional selection
np.where(a > 25, a, 0)          # replace False positions with 0
np.where(a > 25, a, -1)
rows, cols = np.where(m > 5)    # indices where condition is True`,
                },
                {
                  order: 2, language: "python", label: "newaxis, squeeze & expand_dims",
                  content: `a = np.array([1, 2, 3])    # shape (3,)

# Add axis
a[:, np.newaxis]           # shape (3, 1) — column vector
a[np.newaxis, :]           # shape (1, 3) — row vector
np.expand_dims(a, axis=0)  # shape (1, 3)
np.expand_dims(a, axis=1)  # shape (3, 1)

# Remove length-1 axes
b = np.array([[[1, 2, 3]]])  # shape (1, 1, 3)
np.squeeze(b)                # shape (3,)
np.squeeze(b, axis=0)        # shape (1, 3)

# Useful for broadcasting
col = a[:, np.newaxis]     # (3, 1)
row = a[np.newaxis, :]     # (1, 3)
col + row                  # (3, 3) outer sum`,
                },
              ],
            },
          },
          // ── Reshaping & Combining ─────────────────────────────────────────
          {
            title: "Reshaping & Combining",
            description: "reshape, flatten, transpose, stack, concatenate, and split",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Reshape & transpose",
                  content: `a = np.arange(12)

a.reshape(3, 4)          # new shape (must be compatible)
a.reshape(3, -1)         # infer last dim automatically
a.reshape(-1)            # flatten to 1D

a.flatten()              # copy, always 1D
a.ravel()                # view if possible, 1D

b = np.arange(24).reshape(2, 3, 4)
b.T                      # transpose (reverses axis order)
np.transpose(b, (1, 0, 2))   # custom axis order
b.swapaxes(0, 1)         # swap two specific axes`,
                },
                {
                  order: 1, language: "python", label: "Stack & concatenate",
                  content: `a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

np.concatenate([a, b])           # [1 2 3 4 5 6]
np.stack([a, b])                 # shape (2, 3) — new axis
np.stack([a, b], axis=1)         # shape (3, 2)
np.vstack([a, b])                # vertical stack — shape (2, 3)
np.hstack([a, b])                # horizontal stack — shape (6,)
np.dstack([a, b])                # depth stack — shape (1, 3, 2)

# column_stack / row_stack
np.column_stack([a, b])          # shape (3, 2)
np.row_stack([a, b])             # shape (2, 3)

# block — compose from nested list
np.block([[np.eye(2), np.zeros((2,2))],
          [np.zeros((2,2)), np.eye(2)]])`,
                },
                {
                  order: 2, language: "python", label: "Split",
                  content: `a = np.arange(12).reshape(3, 4)

np.split(a, 3)               # split into 3 equal parts along axis 0
np.split(a, [1, 3], axis=1)  # split at column indices 1 and 3
np.hsplit(a, 2)              # split horizontally into 2
np.vsplit(a, 3)              # split vertically into 3
np.dsplit(b, 2)              # split along depth axis`,
                },
              ],
            },
          },
          // ── Math & Universal Functions ────────────────────────────────────
          {
            title: "Math & Universal Functions (ufuncs)",
            description: "Element-wise math, reductions, ufunc methods, and aggregations",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Element-wise operations",
                  content: `a = np.array([1.0, 4.0, 9.0, 16.0])

# Arithmetic
a + 2;  a - 2;  a * 2;  a / 2
a ** 2;  a // 2;  a % 3

# Math ufuncs
np.sqrt(a)
np.exp(a)
np.log(a);  np.log2(a);  np.log10(a)
np.abs(a)
np.sign(a)
np.ceil(a);  np.floor(a);  np.round(a, 2)
np.clip(a, 2, 10)

# Trig
np.sin(a);  np.cos(a);  np.tan(a)
np.arcsin(a);  np.degrees(a);  np.radians(a)

# Comparison → boolean array
a > 3;  a == 4;  a != 4
np.isnan(a);  np.isinf(a);  np.isfinite(a)`,
                },
                {
                  order: 1, language: "python", label: "Reductions & aggregations",
                  content: `a = np.arange(12).reshape(3, 4)

# Global
a.sum();  a.min();  a.max();  a.mean()
a.std();  a.var()
a.prod()
a.cumsum()
a.argmin();  a.argmax()           # index of min/max

# Along an axis
a.sum(axis=0)     # sum each column  → shape (4,)
a.sum(axis=1)     # sum each row     → shape (3,)
a.max(axis=0)
a.mean(axis=1)

# keepdims — preserve axes for broadcasting
a.sum(axis=1, keepdims=True)    # shape (3, 1)

# Logical reductions
np.any(a > 5)
np.all(a > 0)
np.any(a > 5, axis=1)`,
                },
                {
                  order: 2, language: "python", label: "Ufunc extras",
                  content: `a = np.array([1, 2, 3, 4])
b = np.array([10, 20, 30, 40])

# outer product
np.multiply.outer(a, b)    # (4, 4) — all pairwise products
np.add.outer(a, b)

# reduce
np.multiply.reduce(a)      # 1*2*3*4 = 24
np.add.reduce(a)            # same as a.sum()

# accumulate
np.add.accumulate(a)        # [1, 3, 6, 10] (cumsum)
np.multiply.accumulate(a)   # [1, 2, 6, 24] (cumprod)

# at — unbuffered in-place
np.add.at(a, [0, 1, 0], 10)  # a[0] += 20, a[1] += 10`,
                },
              ],
            },
          },
          // ── Broadcasting ─────────────────────────────────────────────────
          {
            title: "Broadcasting",
            description: "Broadcasting rules, common patterns, and gotchas",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Broadcasting rules",
                  content: `# Rules (applied right-to-left on shapes):
# 1. If arrays have different ndim, prepend 1s to the smaller shape
# 2. Sizes must match, or one of them must be 1
# 3. Arrays with size 1 are stretched to match the other

a = np.ones((3, 4))    # (3, 4)
b = np.ones((4,))      # (4,)  → broadcast to (3, 4)
(a + b).shape          # (3, 4)

# Scalar broadcast
a * 5                  # every element × 5

# Column vector × row vector → matrix
col = np.array([[1], [2], [3]])   # (3, 1)
row = np.array([10, 20, 30, 40])  # (4,) → (1, 4)
(col + row).shape                 # (3, 4)

# Incompatible — raises ValueError
# np.ones((3,)) + np.ones((4,))`,
                },
                {
                  order: 1, language: "python", label: "Practical broadcasting patterns",
                  content: `# Normalise each column (subtract mean, divide by std)
a = np.random.randn(100, 5)
a_norm = (a - a.mean(axis=0)) / a.std(axis=0)

# Row-normalise (L2 norm)
norms = np.linalg.norm(a, axis=1, keepdims=True)
a_unit = a / norms

# Pairwise squared distances (outer subtraction trick)
X = np.random.randn(10, 3)
diffs = X[:, np.newaxis, :] - X[np.newaxis, :, :]  # (10, 10, 3)
sq_dists = (diffs ** 2).sum(axis=-1)               # (10, 10)

# Outer product via broadcasting
a = np.array([1, 2, 3])
b = np.array([10, 20])
a[:, np.newaxis] * b    # (3, 2)`,
                },
              ],
            },
          },
          // ── Linear Algebra ────────────────────────────────────────────────
          {
            title: "Linear Algebra",
            description: "dot, matmul, solve, eigenvalues, SVD, and matrix decompositions",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Matrix operations",
                  content: `A = np.array([[1, 2], [3, 4]], dtype=float)
B = np.array([[5, 6], [7, 8]], dtype=float)

# Matrix multiply
A @ B                   # preferred operator (Python 3.5+)
np.dot(A, B)            # same for 2D
np.matmul(A, B)         # same as @, no scalar allowed

# Element-wise vs matrix multiply
A * B                   # element-wise (Hadamard product)
A @ B                   # matrix product

# Powers
np.linalg.matrix_power(A, 3)

# Transpose & conjugate transpose
A.T
A.conj().T

# Trace & determinant
np.trace(A)
np.linalg.det(A)`,
                },
                {
                  order: 1, language: "python", label: "Decompositions & solvers",
                  content: `A = np.array([[3, 1], [1, 2]], dtype=float)
b = np.array([9, 8], dtype=float)

# Solve linear system Ax = b
x = np.linalg.solve(A, b)

# Inverse & pseudo-inverse
np.linalg.inv(A)
np.linalg.pinv(A)          # Moore-Penrose pseudo-inverse

# Least squares
x, res, rank, sv = np.linalg.lstsq(A, b, rcond=None)

# Eigenvalues & eigenvectors
vals, vecs = np.linalg.eig(A)
vals, vecs = np.linalg.eigh(A)   # symmetric/Hermitian (more stable)

# SVD
U, s, Vt = np.linalg.svd(A)
U, s, Vt = np.linalg.svd(A, full_matrices=False)  # economy SVD

# QR decomposition
Q, R = np.linalg.qr(A)

# Cholesky (positive definite matrix)
L = np.linalg.cholesky(A)

# Norms
np.linalg.norm(b)               # L2 norm
np.linalg.norm(A, ord="fro")    # Frobenius norm
np.linalg.matrix_rank(A)`,
                },
              ],
            },
          },
          // ── Sorting & Searching ───────────────────────────────────────────
          {
            title: "Sorting & Searching",
            description: "sort, argsort, searchsorted, unique, set operations, and np.where",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Sort & argsort",
                  content: `a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

np.sort(a)               # sorted copy
a.sort()                 # in-place

# Along axis
m = np.random.randint(0, 10, (3, 4))
np.sort(m, axis=0)       # sort each column
np.sort(m, axis=1)       # sort each row

# argsort — indices that would sort the array
idx = np.argsort(a)
a[idx]                   # same as np.sort(a)

# Top-k (fast — no full sort)
k = 3
np.argpartition(a, -k)[-k:]     # indices of top-k (unordered)
np.partition(a, -k)[-k:]        # values of top-k (unordered)

# Lexsort — sort by multiple keys (last key is primary)
names  = np.array(["Bob", "Alice", "Alice"])
scores = np.array([90, 85, 92])
idx = np.lexsort((scores, names))   # sort by name, then score`,
                },
                {
                  order: 1, language: "python", label: "Search & set operations",
                  content: `a = np.array([10, 20, 30, 40, 50])

# Search
np.searchsorted(a, 25)          # index to insert 25 to keep sorted → 2
np.searchsorted(a, [15, 35])

# Non-zero / True indices
np.nonzero(a > 25)              # tuple of index arrays
np.flatnonzero(a > 25)          # flat indices

# Unique
np.unique(a)
vals, counts = np.unique(a, return_counts=True)
vals, idx    = np.unique(a, return_index=True)

# Set operations
np.intersect1d(a, b)
np.union1d(a, b)
np.setdiff1d(a, b)              # elements in a not in b
np.in1d(a, b)                   # boolean membership test
np.isin(a, b)                   # same, preferred in newer NumPy`,
                },
              ],
            },
          },
          // ── I/O & Memory ──────────────────────────────────────────────────
          {
            title: "I/O & Memory",
            description: "Save/load arrays, memory-mapped files, and copies vs views",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Save & load",
                  content: `a = np.arange(100).reshape(10, 10)

# Binary formats (fast, lossless)
np.save("array.npy", a)
b = np.load("array.npy")

# Multiple arrays in one file
np.savez("arrays.npz", x=a, y=a*2)
data = np.load("arrays.npz")
data["x"]

# Compressed
np.savez_compressed("arrays.npz", x=a, y=a*2)

# Text (slower, human-readable)
np.savetxt("array.csv", a, delimiter=",", fmt="%.4f")
b = np.loadtxt("array.csv", delimiter=",")

# Memory-mapped (large files that don't fit in RAM)
fp = np.memmap("data.dat", dtype="float32", mode="w+", shape=(1000, 1000))
fp[0, :] = np.random.rand(1000)
del fp   # flush to disk`,
                },
                {
                  order: 1, language: "python", label: "Copies vs views",
                  content: `a = np.arange(10)

# Views — share memory with original
b = a[2:5]          # slice → view
b[0] = 99           # modifies a too!
a.view()            # explicit view

# Check if view
b.base is a         # True if b is a view of a

# Copies — independent
c = a.copy()
c = a[2:5].copy()
c = a[[0, 2, 4]]    # fancy indexing → always a copy

# np.shares_memory
np.shares_memory(a, b)

# Contiguous memory (important for performance)
a.flags["C_CONTIGUOUS"]         # row-major (C order)
a.flags["F_CONTIGUOUS"]         # column-major (Fortran order)
np.ascontiguousarray(a)         # make C-contiguous copy if needed`,
                },
              ],
            },
          },
          // ── Performance Patterns ──────────────────────────────────────────
          {
            title: "Performance Patterns",
            description: "Vectorisation, einsum, numexpr, and profiling tips",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "einsum — Einstein summation",
                  content: `A = np.random.rand(3, 4)
B = np.random.rand(4, 5)
v = np.random.rand(4)

# Matrix multiply — "ij,jk->ik"
np.einsum("ij,jk->ik", A, B)     # same as A @ B

# Dot product — "i,i->"
np.einsum("i,i->", v, v)         # same as np.dot(v, v)

# Outer product — "i,j->ij"
np.einsum("i,j->ij", v, v)

# Trace — "ii->"
np.einsum("ii->", A[:4, :4])     # sum of diagonal

# Batch matrix multiply — "bij,bjk->bik"
# (useful in neural networks)
batch = np.random.rand(8, 3, 4)
W     = np.random.rand(8, 4, 5)
np.einsum("bij,bjk->bik", batch, W)

# Optimised contraction order
np.einsum("ij,jk->ik", A, B, optimize=True)`,
                },
                {
                  order: 1, language: "python", label: "Practical performance tips",
                  content: `# Use vectorised operations — avoid Python loops
# Bad
result = [x**2 for x in a]
# Good
result = a**2

# Pre-allocate output arrays
out = np.empty(n)
np.sqrt(a, out=out)       # write result into pre-allocated array

# Use float32 instead of float64 when precision allows
a32 = a.astype(np.float32)   # half the memory, faster on GPU

# np.einsum vs explicit ops — benchmark both
# %timeit a @ b
# %timeit np.einsum("ij,jk->ik", a, b)

# numexpr for large arrays (avoids temporary arrays)
import numexpr as ne
ne.evaluate("2 * a ** 2 + 3 * b")

# Numba JIT for custom loops
from numba import njit
@njit
def fast_loop(a):
    s = 0.0
    for x in a:
        s += x ** 2
    return s`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created NumPy cheatsheet: ${numpy.name} (${numpy.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
