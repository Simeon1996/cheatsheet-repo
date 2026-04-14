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
    where: { name: "ML Math", userId: admin.id },
  });

  const mlmath = await prisma.category.create({
    data: {
      name: "ML Math",
      icon: "∑",
      color: "indigo",
      description: "Mathematical foundations of machine learning: linear algebra, calculus, matrix calculus, probability theory, information theory, and statistical learning theory",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Linear Algebra ────────────────────────────────────────────────
          {
            title: "Linear Algebra Fundamentals",
            description: "Vectors, matrices, norms, inner products, projections, and matrix properties",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Vectors & norms",
                  content: `VECTOR NORMS
────────────────────────────────────────────
L0  norm   ‖x‖₀  = number of non-zero entries
L1  norm   ‖x‖₁  = Σᵢ |xᵢ|
L2  norm   ‖x‖₂  = √(Σᵢ xᵢ²) = √(xᵀx)
Lp  norm   ‖x‖ₚ  = (Σᵢ |xᵢ|ᵖ)^(1/p)
L∞  norm   ‖x‖∞  = maxᵢ |xᵢ|

INNER PRODUCT (standard)
  ⟨x, y⟩ = xᵀy = Σᵢ xᵢyᵢ

CAUCHY-SCHWARZ INEQUALITY
  |⟨x, y⟩| ≤ ‖x‖ · ‖y‖

COSINE OF ANGLE BETWEEN VECTORS
  cos θ = (xᵀy) / (‖x‖ · ‖y‖)
  x ⊥ y  ⟺  xᵀy = 0

TRIANGLE INEQUALITY
  ‖x + y‖ ≤ ‖x‖ + ‖y‖

PROJECTION of x onto unit vector u
  proj_u(x) = (xᵀu) u`,
                },
                {
                  order: 1, language: "text", label: "Matrix properties & norms",
                  content: `MATRIX NORMS
────────────────────────────────────────────
Frobenius      ‖A‖_F  = √(Σᵢⱼ Aᵢⱼ²) = √(tr(AᵀA))
Spectral (L2)  ‖A‖₂   = σ_max(A)   (largest singular value)
Nuclear        ‖A‖_*  = Σᵢ σᵢ(A)   (sum of singular values)
Max            ‖A‖_max = maxᵢⱼ |Aᵢⱼ|

TRACE
  tr(A)   = Σᵢ Aᵢᵢ
  tr(AB)  = tr(BA)           (cyclic property)
  tr(AᵀB) = Σᵢⱼ AᵢⱼBᵢⱼ    = ⟨A, B⟩_F
  tr(A)   = Σᵢ λᵢ           (sum of eigenvalues)

DETERMINANT
  det(AB)  = det(A) det(B)
  det(Aᵀ)  = det(A)
  det(A⁻¹) = 1 / det(A)
  det(cA)  = cⁿ det(A)      (n×n matrix)
  det(A)   = Πᵢ λᵢ          (product of eigenvalues)

RANK-NULLITY THEOREM
  rank(A) + nullity(A) = n   (for A ∈ ℝᵐˣⁿ)

MATRIX INVERSION LEMMA (Woodbury identity)
  (A + UCV)⁻¹ = A⁻¹ - A⁻¹U(C⁻¹ + VA⁻¹U)⁻¹VA⁻¹`,
                },
                {
                  order: 2, language: "text", label: "Eigendecomposition & SVD",
                  content: `EIGENDECOMPOSITION  (A must be square)
  Av = λv              (v: eigenvector, λ: eigenvalue)
  A  = Q Λ Q⁻¹         (Q: eigenvectors as columns, Λ = diag(λᵢ))
  Aᵏ = Q Λᵏ Q⁻¹

  Symmetric A: A = QΛQᵀ  (Q orthogonal, all λᵢ ∈ ℝ)
  PSD (A ≽ 0):  all λᵢ ≥ 0
  PD  (A ≻ 0):  all λᵢ > 0

SINGULAR VALUE DECOMPOSITION  (any matrix)
  A = U Σ Vᵀ
  A ∈ ℝᵐˣⁿ,  U ∈ ℝᵐˣᵐ,  Σ ∈ ℝᵐˣⁿ,  V ∈ ℝⁿˣⁿ
  U, V orthogonal;  Σ = diag(σ₁ ≥ σ₂ ≥ … ≥ 0)
  σᵢ = √λᵢ(AᵀA) = √λᵢ(AAᵀ)

  ‖A‖_F² = Σᵢ σᵢ²
  rank(A) = number of non-zero σᵢ

MOORE-PENROSE PSEUDO-INVERSE
  A⁺ = V Σ⁺ Uᵀ     (Σ⁺: reciprocal of non-zero singular values)
  Least-squares solution:  x* = A⁺b = (AᵀA)⁻¹Aᵀb

LOW-RANK APPROXIMATION (Eckart-Young theorem)
  Aₖ = Σᵢ₌₁ᵏ σᵢ uᵢ vᵢᵀ  minimises ‖A - B‖_F over all rank-k B`,
                },
              ],
            },
          },
          // ── Calculus & Gradients ──────────────────────────────────────────
          {
            title: "Calculus & Gradients",
            description: "Derivatives, chain rule, gradients, Jacobians, Hessians, and Taylor expansion",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Gradient, Jacobian & Hessian",
                  content: `GRADIENT  (scalar function f : ℝⁿ → ℝ)
  ∇f(x) = [∂f/∂x₁, ∂f/∂x₂, …, ∂f/∂xₙ]ᵀ  ∈ ℝⁿ
  Points in the direction of steepest ascent
  ‖∇f(x)‖ = rate of fastest increase

JACOBIAN  (vector function f : ℝⁿ → ℝᵐ)
           ⎡ ∂f₁/∂x₁  …  ∂f₁/∂xₙ ⎤
  J_f(x) = ⎢    ⋮               ⋮  ⎥  ∈ ℝᵐˣⁿ
           ⎣ ∂fₘ/∂x₁  …  ∂fₘ/∂xₙ ⎦

HESSIAN  (scalar function f : ℝⁿ → ℝ)
  H_f(x)ᵢⱼ = ∂²f / (∂xᵢ ∂xⱼ)   ∈ ℝⁿˣⁿ (symmetric)
  H = ∇²f(x) = J(∇f(x))
  f convex  ⟺  H ≽ 0 (PSD) everywhere

CHAIN RULE
  d/dt f(g(t)) = ∇f(g(t))ᵀ g'(t)
  Multivariate: ∂z/∂x = (∂z/∂y)(∂y/∂x)   (matrix multiply)
  Backprop IS the chain rule applied recursively`,
                },
                {
                  order: 1, language: "text", label: "Taylor expansion & optimality conditions",
                  content: `TAYLOR EXPANSION (around x₀)
  f(x) ≈ f(x₀) + ∇f(x₀)ᵀ(x−x₀) + ½(x−x₀)ᵀH(x₀)(x−x₀) + …

  Linear approx:    f(x₀+δ) ≈ f(x₀) + ∇f(x₀)ᵀδ
  Quadratic approx: f(x₀+δ) ≈ f(x₀) + ∇f(x₀)ᵀδ + ½δᵀHδ

FIRST-ORDER OPTIMALITY
  Necessary:  ∇f(x*) = 0  (stationary point)

SECOND-ORDER CONDITIONS
  Local minimum:  ∇f(x*) = 0  AND  H(x*) ≻ 0  (PD)
  Local maximum:  ∇f(x*) = 0  AND  H(x*) ≺ 0  (ND)
  Saddle point:   ∇f(x*) = 0  AND  H(x*) indefinite

CONVEXITY
  f convex  ⟺  f(λx + (1−λ)y) ≤ λf(x) + (1−λ)f(y)  ∀λ ∈ [0,1]
  f convex  ⟹  every local minimum is a global minimum
  f strongly convex (param μ):  f(y) ≥ f(x) + ∇f(x)ᵀ(y−x) + (μ/2)‖y−x‖²

LIPSCHITZ GRADIENT (L-smooth)
  ‖∇f(x) − ∇f(y)‖ ≤ L‖x − y‖
  GD converges at rate O(1/k) for L-smooth convex f
  GD step size rule:  η ≤ 1/L`,
                },
                {
                  order: 2, language: "text", label: "Gradient descent convergence",
                  content: `GRADIENT DESCENT:  x_{t+1} = x_t − η ∇f(x_t)

CONVERGENCE RATES
  ─────────────────────────────────────────────────────
  Condition             Rate          Iterations for ε
  ─────────────────────────────────────────────────────
  Convex, L-smooth      O(1/k)        O(1/ε)
  μ-strongly convex     O((1−μ/L)^k)  O((L/μ) log 1/ε)
  Non-convex            O(1/√k)       O(1/ε²)
  ─────────────────────────────────────────────────────
  Condition number:  κ = L/μ  (large κ → slow convergence)

NEWTON'S METHOD (second-order)
  x_{t+1} = x_t − H(x_t)⁻¹ ∇f(x_t)
  Quadratic convergence near minimum (expensive per step)

GRADIENT DESCENT WITH MOMENTUM (Heavy Ball)
  v_{t+1} = β v_t + (1−β) ∇f(x_t)
  x_{t+1} = x_t − η v_{t+1}

NESTEROV'S ACCELERATED GRADIENT
  y_{t+1} = x_t − η ∇f(x_t)
  x_{t+1} = y_{t+1} + (t−1)/(t+2) (y_{t+1} − y_t)
  Rate: O(1/k²) for convex L-smooth  (optimal for first-order methods)

PROXIMAL GRADIENT (composite f = g + h, h non-smooth)
  x_{t+1} = prox_{ηh}(x_t − η ∇g(x_t))
  prox_h(v) = argmin_x { h(x) + (1/2η)‖x−v‖² }
  For h = λ‖·‖₁:  prox = soft-threshold S_λη(v)`,
                },
              ],
            },
          },
          // ── Matrix Calculus ───────────────────────────────────────────────
          {
            title: "Matrix Calculus",
            description: "Derivatives with respect to vectors and matrices, essential identities",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Derivatives w.r.t. vectors",
                  content: `NUMERATOR LAYOUT CONVENTION
  ∂(scalar) / ∂(vector)  →  row vector (or column with transpose)
  ∂(vector) / ∂(scalar)  →  column vector

CORE IDENTITIES  (x, a, b ∈ ℝⁿ;  A, B ∈ ℝⁿˣⁿ)
  ∂/∂x (aᵀx)        = a
  ∂/∂x (xᵀa)        = a
  ∂/∂x (xᵀx)        = 2x
  ∂/∂x (xᵀAx)       = (A + Aᵀ)x  =  2Ax  if A symmetric
  ∂/∂x (aᵀXb)       = abᵀ         (X matrix, derivative w.r.t. X)
  ∂/∂x ‖Ax − b‖²    = 2Aᵀ(Ax − b)
  ∂/∂x ‖x‖₂         = x / ‖x‖₂

SOFTMAX JACOBIAN
  sᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)
  ∂sᵢ/∂zⱼ = sᵢ(δᵢⱼ − sⱼ)
  J_s = diag(s) − ssᵀ

CROSS-ENTROPY + SOFTMAX (combined gradient — simplifies beautifully)
  L = −Σₖ yₖ log sₖ
  ∂L/∂z = s − y    (prediction minus label)`,
                },
                {
                  order: 1, language: "text", label: "Derivatives w.r.t. matrices",
                  content: `DERIVATIVES W.R.T. MATRICES  (A, X ∈ ℝᵐˣⁿ)
  ∂/∂A tr(AᵀB)      = B
  ∂/∂A tr(AB)        = Bᵀ
  ∂/∂A tr(AᵀAB)     = AB + ABᵀ ... (see denominator layout)
  ∂/∂A tr(ABAC)      = BᵀAᵀCᵀ + CᵀAᵀBᵀ  (if A appears twice)
  ∂/∂A log det(A)    = A⁻ᵀ  =  (Aᵀ)⁻¹
  ∂/∂A det(A)        = det(A) · A⁻ᵀ
  ∂/∂A ‖A‖_F²        = 2A

USEFUL IN GAUSSIAN LIKELIHOOD (μ, Σ parameters)
  log p(x | μ, Σ) = −½ (x−μ)ᵀ Σ⁻¹ (x−μ) − ½ log det(Σ) − (d/2) log 2π

  ∂/∂μ  log p = Σ⁻¹(x − μ)
  ∂/∂Σ⁻¹ log p = ½ [Σ − (x−μ)(x−μ)ᵀ]   (set to 0 → MLE)

KRONECKER PRODUCT IDENTITY
  vec(AXB) = (Bᵀ ⊗ A) vec(X)
  (useful for vectorising matrix gradient equations)`,
                },
              ],
            },
          },
          // ── Probability Theory ────────────────────────────────────────────
          {
            title: "Probability Theory",
            description: "Expectation, variance, covariance, inequalities, and convergence",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Expectation & variance",
                  content: `EXPECTATION
  E[X]         = Σₓ x P(X=x)         (discrete)
               = ∫ x p(x) dx          (continuous)
  E[aX + bY]   = a E[X] + b E[Y]     (linearity — always holds)
  E[XY]        = E[X] E[Y]            only if X ⊥ Y (independent)
  E[g(X)]     ≠ g(E[X])              (Jensen's inequality for non-linear g)

VARIANCE
  Var(X)       = E[(X − μ)²] = E[X²] − (E[X])²
  Var(aX + b)  = a² Var(X)
  Var(X + Y)   = Var(X) + Var(Y) + 2 Cov(X,Y)
  Var(X + Y)   = Var(X) + Var(Y)     if X ⊥ Y

COVARIANCE & CORRELATION
  Cov(X, Y)    = E[(X−μ_X)(Y−μ_Y)] = E[XY] − E[X]E[Y]
  Cov(X, X)    = Var(X)
  Corr(X, Y)   = Cov(X,Y) / (σ_X σ_Y) ∈ [−1, 1]

COVARIANCE MATRIX  (X ∈ ℝᵈ)
  Σ = E[(X−μ)(X−μ)ᵀ]   (d×d PSD matrix)
  Σᵢⱼ = Cov(Xᵢ, Xⱼ)

LAW OF TOTAL EXPECTATION
  E[X] = E[E[X|Y]]

LAW OF TOTAL VARIANCE
  Var(X) = E[Var(X|Y)] + Var(E[X|Y])`,
                },
                {
                  order: 1, language: "text", label: "Key inequalities",
                  content: `JENSEN'S INEQUALITY
  For convex f:   f(E[X]) ≤ E[f(X)]
  For concave f:  f(E[X]) ≥ E[f(X)]
  Example (log is concave):  log E[X] ≥ E[log X]

MARKOV'S INEQUALITY  (X ≥ 0)
  P(X ≥ a) ≤ E[X] / a

CHEBYSHEV'S INEQUALITY
  P(|X − μ| ≥ kσ) ≤ 1/k²

CHERNOFF BOUND  (X = Σ Xᵢ, Xᵢ ∈ {0,1} independent, μ = E[X])
  P(X ≥ (1+δ)μ) ≤ exp(−μδ²/3)   for δ ∈ (0,1)
  P(X ≤ (1−δ)μ) ≤ exp(−μδ²/2)

HOEFFDING'S INEQUALITY  (Xᵢ ∈ [aᵢ, bᵢ])
  P(X̄ − E[X̄] ≥ t) ≤ exp(−2n²t² / Σᵢ(bᵢ−aᵢ)²)

CAUCHY-SCHWARZ (probabilistic form)
  |E[XY]|² ≤ E[X²] E[Y²]

AM-GM INEQUALITY
  (x₁ + … + xₙ)/n ≥ (x₁ · … · xₙ)^(1/n)   for xᵢ ≥ 0`,
                },
                {
                  order: 2, language: "text", label: "Key distributions",
                  content: `GAUSSIAN  N(μ, σ²)
  p(x) = (1/√(2πσ²)) exp(−(x−μ)²/(2σ²))
  E[X]=μ,  Var(X)=σ²
  Sum of Gaussians: N(μ₁,σ₁²) + N(μ₂,σ₂²) = N(μ₁+μ₂, σ₁²+σ₂²)
  Standard normal: Z=(X−μ)/σ ~ N(0,1)

MULTIVARIATE GAUSSIAN  N(μ, Σ)
  p(x) = (2π)^(−d/2) |Σ|^(−1/2) exp(−½(x−μ)ᵀΣ⁻¹(x−μ))
  Mahalanobis dist²: (x−μ)ᵀΣ⁻¹(x−μ) ~ χ²(d)
  Marginalisation:  if (X,Y)~N, then X~N(μ_X, Σ_XX)
  Conditioning:     X|Y ~ N(μ_X + Σ_XY Σ_YY⁻¹(y−μ_Y), Σ_XX − Σ_XY Σ_YY⁻¹ Σ_YX)

BERNOULLI  Ber(p):   P(X=1)=p, E=p, Var=p(1−p)
BINOMIAL   B(n,p):   P(X=k)=C(n,k)pᵏ(1−p)ⁿ⁻ᵏ, E=np, Var=np(1−p)
CATEGORICAL Cat(π):  P(X=k)=πₖ, Σπₖ=1
POISSON    Poi(λ):   P(X=k)=λᵏe⁻λ/k!, E=λ, Var=λ
EXPONENTIAL Exp(λ):  p(x)=λe⁻λˣ, E=1/λ, Var=1/λ²
DIRICHLET  Dir(α):   p(π)∝Πₖπₖ^(αₖ−1), E[πₖ]=αₖ/α₀  (α₀=Σαₖ)`,
                },
              ],
            },
          },
          // ── Information Theory ────────────────────────────────────────────
          {
            title: "Information Theory",
            description: "Entropy, mutual information, KL divergence, and the information bottleneck",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Entropy & divergences",
                  content: `SHANNON ENTROPY  (bits with log₂, nats with ln)
  H(X)     = −Σₓ P(x) log P(x)  ≥ 0
  H(X)     = 0   ⟺  X is deterministic
  H(X)    ≤ log|X|  (maximised by uniform distribution)

JOINT & CONDITIONAL ENTROPY
  H(X,Y)   = −Σₓᵧ P(x,y) log P(x,y)
  H(X|Y)   = H(X,Y) − H(Y)  =  E_Y[H(X|Y=y)]
  H(X,Y)  ≤ H(X) + H(Y)      (chain rule; equality if independent)
  H(X|Y)  ≤ H(X)              (conditioning reduces entropy)

CROSS-ENTROPY
  H(P, Q)  = −Σₓ P(x) log Q(x)  =  H(P) + KL(P‖Q)  ≥ H(P)
  Used as loss: if P=true labels, Q=model predictions

KL DIVERGENCE (relative entropy)  — NOT symmetric
  KL(P‖Q) = Σₓ P(x) log(P(x)/Q(x))  =  E_P[log P/Q]  ≥ 0
  KL(P‖Q) = 0  ⟺  P = Q   (Gibbs inequality)
  KL(P‖Q) ≠ KL(Q‖P)

JENSEN-SHANNON DIVERGENCE  (symmetric, bounded)
  JSD(P‖Q) = ½ KL(P‖M) + ½ KL(Q‖M),   M = ½(P+Q)
  JSD ∈ [0, 1]  (using log₂)
  √JSD is a true metric`,
                },
                {
                  order: 1, language: "text", label: "Mutual information",
                  content: `MUTUAL INFORMATION
  I(X;Y) = H(X) − H(X|Y)
           = H(Y) − H(Y|X)
           = H(X) + H(Y) − H(X,Y)
           = KL(P(X,Y) ‖ P(X)P(Y))  ≥ 0
  I(X;Y) = 0  ⟺  X and Y are independent
  I(X;X) = H(X)   (self-information = entropy)
  I(X;Y|Z) = H(X|Z) − H(X|Y,Z)   (conditional MI)

INFORMATION DIAGRAM (Venn-style)
  ┌──────────────────────────────┐
  │  H(X)          H(Y)         │
  │  ┌──────┬──────────┐        │
  │  │ H(X|Y)│ I(X;Y) │H(Y|X)  │
  │  └──────┴──────────┘        │
  └──────────────────────────────┘

DATA PROCESSING INEQUALITY
  If X → Y → Z is a Markov chain:
  I(X;Z) ≤ I(X;Y)
  Processing cannot increase information

FANO'S INEQUALITY
  H(X|Y) ≤ H(Pₑ) + Pₑ log(|X|−1)
  Where Pₑ = P(X̂ ≠ X) is the error probability
  Sets a lower bound on classification error from entropy`,
                },
              ],
            },
          },
          // ── Statistical Learning Theory ───────────────────────────────────
          {
            title: "Statistical Learning Theory",
            description: "Bias-variance tradeoff, PAC learning, VC dimension, and generalisation bounds",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Bias-variance decomposition",
                  content: `EXPECTED PREDICTION ERROR  (for squared loss, new point x)
  E[(y − f̂(x))²] = Bias²(f̂(x)) + Var(f̂(x)) + σ²

  Bias²(f̂(x)) = (E[f̂(x)] − f(x))²      — systematic error
  Var(f̂(x))   = E[(f̂(x) − E[f̂(x)])²]  — sensitivity to training data
  σ²           = irreducible noise

TRADE-OFF
  High bias  →  underfitting  (model too simple)
  High variance → overfitting  (model too complex)
  Optimal model: minimise bias² + variance

DOUBLE DESCENT (modern deep learning phenomenon)
  Classical regime:  test error forms a U-shape (bias-variance tradeoff)
  Modern regime:     after interpolation threshold, test error DECREASES again
  Overparameterised models (# params > # samples) can still generalise

DECOMPOSITION FOR CLASSIFICATION  (0-1 loss)
  No clean bias-variance decomposition exists, but conceptually:
  Error = noise + (difficulty of true boundary) + (model's failure to capture it)`,
                },
                {
                  order: 1, language: "text", label: "PAC learning & VC dimension",
                  content: `PAC LEARNING (Probably Approximately Correct)
  A hypothesis class H is PAC-learnable if there exists an algorithm such that
  for any ε > 0, δ > 0, with probability ≥ 1−δ:
  L(h) ≤ L(h*) + ε
  using m ≥ O(1/ε · log(|H|/δ)) training samples

FINITE HYPOTHESIS CLASS
  P(L(h_ERM) > L(h*) + ε) ≤ |H| · exp(−2mε²)
  Sample complexity:  m ≥ (1/2ε²) log(|H|/δ)

VC DIMENSION (Vapnik-Chervonenkis)
  VCdim(H) = largest set S shattered by H
  (H shatters S if every labelling of S is achievable by some h ∈ H)

  Hyperplanes in ℝᵈ:    VCdim = d + 1
  Intervals in ℝ:        VCdim = 2
  Circles in ℝ²:         VCdim = 3

FUNDAMENTAL THEOREM OF STATISTICAL LEARNING
  H is PAC-learnable ⟺  VCdim(H) < ∞

GENERALIZATION BOUND (VC theory)
  With probability ≥ 1−δ, for all h ∈ H:
  L(h) ≤ L_S(h) + √(8 VCdim(H) log(em/VCdim(H)) + 8 log(4/δ)) / √m

  L(h)   = true risk,  L_S(h) = empirical risk
  First term:  training error  (zero for interpolating models)
  Second term: complexity penalty  (VC dimension / √m)`,
                },
                {
                  order: 2, language: "text", label: "Rademacher complexity & regularisation theory",
                  content: `RADEMACHER COMPLEXITY  (data-dependent, tighter than VC)
  R_m(H) = E_σ[ sup_{h∈H} (1/m) Σᵢ σᵢ h(xᵢ) ]
  σᵢ ∈ {−1, +1} uniform random (Rademacher variables)

GENERALISATION BOUND (Rademacher)
  With probability ≥ 1−δ:
  L(h) ≤ L_S(h) + 2R_m(H) + √(log(1/δ)/2m)

STRUCTURAL RISK MINIMISATION
  Minimise:  L_S(h) + λ · Ω(h)
  Ω(h) = complexity/regularisation term

RIDGE REGRESSION (L2 regularised least squares)
  min_w ‖Xw − y‖² + λ‖w‖²
  Closed form:  w* = (XᵀX + λI)⁻¹Xᵀy
  Bayesian interpretation: MAP estimate with Gaussian prior w ~ N(0, σ²/λ I)

LASSO (L1 regularised)
  min_w ‖Xw − y‖² + λ‖w‖₁
  Encourages sparsity (many wᵢ = 0 exactly)
  Bayesian interpretation: MAP with Laplace prior

ELASTIC NET
  min_w ‖Xw − y‖² + λ₁‖w‖₁ + λ₂‖w‖²
  Combines sparsity (L1) with grouping effect (L2)`,
                },
              ],
            },
          },
          // ── Bayesian Methods ──────────────────────────────────────────────
          {
            title: "Bayesian Methods",
            description: "Bayes' theorem, conjugate priors, Bayesian inference, and variational methods",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Bayesian inference framework",
                  content: `BAYES' THEOREM
  P(θ|X) = P(X|θ) P(θ) / P(X)
  posterior = likelihood × prior / evidence

  P(X) = ∫ P(X|θ) P(θ) dθ    (marginal likelihood / evidence — often intractable)

POINT ESTIMATES FROM POSTERIOR
  MAP (Maximum A Posteriori):  θ_MAP = argmax_θ P(θ|X)
                                      = argmax_θ [log P(X|θ) + log P(θ)]
  MLE:  θ_MLE = argmax_θ P(X|θ)      (flat prior → MAP = MLE)
  Posterior mean:  E[θ|X] = ∫ θ P(θ|X) dθ   (minimises MSE)

CONJUGATE PRIORS  (posterior has same form as prior)
  ──────────────────────────────────────────────────────
  Likelihood        Prior           Posterior
  ──────────────────────────────────────────────────────
  Binomial Bin(p)   Beta(α,β)       Beta(α+k, β+n−k)
  Gaussian N(μ,σ²)  Gaussian N(μ₀)  Gaussian (updated)
  Multinomial       Dirichlet(α)    Dirichlet(α + counts)
  Poisson Poi(λ)    Gamma(a,b)      Gamma(a+Σx, b+n)
  ──────────────────────────────────────────────────────

BAYESIAN LINEAR REGRESSION
  Prior:      w ~ N(0, α⁻¹I)
  Likelihood: y | X, w ~ N(Xw, β⁻¹I)
  Posterior:  w | X, y ~ N(μ_N, S_N)
  S_N = (αI + βXᵀX)⁻¹
  μ_N = β S_N Xᵀy
  Predictive: p(y*|x*, X, y) = N(μ_N ᵀ x*, σ²_N(x*))`,
                },
                {
                  order: 1, language: "text", label: "Variational inference & ELBO",
                  content: `VARIATIONAL INFERENCE  (approximate intractable posterior)
  Approximate p(θ|X) with q(θ; φ) from a tractable family
  Minimise KL(q(θ;φ) ‖ p(θ|X))

  Equivalently, MAXIMISE the ELBO:
  ELBO(φ) = E_q[log p(X,θ)] − E_q[log q(θ;φ)]
           = E_q[log p(X|θ)] − KL(q(θ;φ) ‖ p(θ))
           = log p(X) − KL(q(θ;φ) ‖ p(θ|X))

  Since KL ≥ 0:  ELBO ≤ log p(X)   (tight when q = posterior)

MEAN FIELD APPROXIMATION
  q(θ) = Πᵢ qᵢ(θᵢ)   (factored, independent approximation)
  Optimal factor:  log q*_j(θⱼ) = E_{i≠j}[log p(X, θ)] + const

VAE (Variational Autoencoder)
  Encoder:  q_φ(z|x) ≈ N(μ_φ(x), σ²_φ(x))
  Decoder:  p_θ(x|z)
  Loss:     −ELBO = −E_q[log p_θ(x|z)] + KL(q_φ(z|x) ‖ p(z))
  Reparameterisation trick:  z = μ_φ(x) + σ_φ(x) · ε,  ε ~ N(0,I)`,
                },
              ],
            },
          },
          // ── Kernel Methods ────────────────────────────────────────────────
          {
            title: "Kernel Methods",
            description: "Mercer's theorem, kernel trick, SVM primal/dual, and Gaussian processes",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Kernel trick & Mercer's theorem",
                  content: `KERNEL FUNCTION
  k(x, x') = ⟨φ(x), φ(x')⟩_H
  Maps data to (possibly infinite-dimensional) feature space H
  without explicitly computing φ(x)

MERCER'S THEOREM
  k is a valid kernel iff the Gram matrix K is PSD for any data:
  Kᵢⱼ = k(xᵢ, xⱼ)   →   K ≽ 0  (all eigenvalues ≥ 0)

COMMON KERNELS
  Linear:       k(x,x') = xᵀx'
  Polynomial:   k(x,x') = (xᵀx' + c)ᵈ
  RBF/Gaussian: k(x,x') = exp(−‖x−x'‖²/(2σ²))    (universal kernel)
  Laplacian:    k(x,x') = exp(−‖x−x'‖/σ)
  Matern:       parametric family interpolating between RBF and Ornstein-Uhlenbeck
  Sigmoid:      k(x,x') = tanh(αxᵀx' + c)         (not always PSD)

KERNEL COMPOSITION RULES  (preserving validity)
  k₁ + k₂       valid kernel  (sum)
  k₁ · k₂       valid kernel  (product)
  c · k          valid kernel  (c > 0)
  f(x)k(x,x')f(x') valid kernel  (scaling)
  k(φ(x),φ(x')) valid kernel  (composition with any φ)`,
                },
                {
                  order: 1, language: "text", label: "SVM & Gaussian processes",
                  content: `SUPPORT VECTOR MACHINE (hard margin)
  Primal:  min_{w,b} ½‖w‖²   s.t. yᵢ(wᵀxᵢ+b) ≥ 1
  Dual:    max_α Σᵢ αᵢ − ½ Σᵢⱼ αᵢαⱼ yᵢyⱼ k(xᵢ,xⱼ)
           s.t. αᵢ ≥ 0, Σᵢ αᵢyᵢ = 0

  Decision function:  f(x) = Σᵢ αᵢ yᵢ k(xᵢ, x) + b
  Support vectors: points where αᵢ > 0  (on the margin)
  Margin width: 2/‖w‖

SOFT MARGIN SVM (slack variables ξᵢ ≥ 0)
  Primal:  min ½‖w‖² + C Σᵢ ξᵢ   s.t. yᵢ(wᵀxᵢ+b) ≥ 1−ξᵢ
  C controls bias-variance: large C → narrow margin, low bias

GAUSSIAN PROCESS
  f ~ GP(m(x), k(x,x'))
  m(x) = E[f(x)]   (mean function, often 0)
  k(x,x') = Cov(f(x), f(x'))  (kernel = covariance function)

  Posterior given observations y = f(X) + ε, ε ~ N(0, σ²I):
  f* | X, y, x* ~ N(μ*, Σ*)
  μ*  = k(x*,X) [k(X,X) + σ²I]⁻¹ y
  Σ*  = k(x*,x*) − k(x*,X) [k(X,X) + σ²I]⁻¹ k(X,x*)`,
                },
              ],
            },
          },
          // ── Dimensionality & Manifolds ────────────────────────────────────
          {
            title: "Dimensionality & Manifold Hypothesis",
            description: "Curse of dimensionality, concentration of measure, and manifold learning",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Curse of dimensionality",
                  content: `VOLUME OF A UNIT HYPERSPHERE IN d DIMENSIONS
  V_d(r=1) = πᵈ/² / Γ(d/2 + 1)
  V₁=2, V₂=π, V₃=4π/3, V₄=π²/2, …
  As d→∞:  V_d → 0   (sphere collapses relative to cube)

CONCENTRATION OF MEASURE
  In high dimensions, most volume of a ball is near its surface.
  For a uniform distribution on a d-ball, fraction within shell of
  thickness ε of the boundary → 1 − (1−ε/r)^d  → 1 as d→∞.

DISTANCE CONCENTRATION  (uniform distribution on hypercube [0,1]ᵈ)
  E[‖x−y‖²] = d/6
  Var[‖x−y‖]  / E[‖x−y‖]  → 0  as d → ∞
  All pairwise distances become similar: ‖x−y‖_max/‖x−y‖_min → 1

  Implication: k-NN becomes meaningless in very high d

SAMPLE COMPLEXITY TO COVER [0,1]ᵈ WITH RESOLUTION ε
  N ~ (1/ε)ᵈ   (exponential in d)
  To maintain fixed density: samples must grow exponentially with d

JOHNSON-LINDENSTRAUSS LEMMA
  For any set of n points in ℝᵈ, there exists a projection
  f: ℝᵈ → ℝᵏ  with k = O(log n / ε²) such that:
  (1−ε)‖u−v‖² ≤ ‖f(u)−f(v)‖² ≤ (1+ε)‖u−v‖²

  Random Gaussian projections achieve this with high probability.`,
                },
              ],
            },
          },
          // ── Optimisation Theory ───────────────────────────────────────────
          {
            title: "Optimisation Theory",
            description: "Constrained optimisation, Lagrangians, KKT conditions, and duality",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Lagrangians & KKT conditions",
                  content: `CONSTRAINED OPTIMISATION PROBLEM
  min_x  f(x)
  s.t.   hᵢ(x) = 0,   i = 1,…,p   (equality)
         gⱼ(x) ≤ 0,   j = 1,…,q   (inequality)

LAGRANGIAN
  L(x, λ, μ) = f(x) + Σᵢ λᵢ hᵢ(x) + Σⱼ μⱼ gⱼ(x)
  λᵢ: equality multipliers (unconstrained sign)
  μⱼ: inequality multipliers (μⱼ ≥ 0)

KKT CONDITIONS (necessary for constrained optimality)
  ① Stationarity:       ∇_x L = 0
  ② Primal feasibility: hᵢ(x*) = 0,  gⱼ(x*) ≤ 0
  ③ Dual feasibility:   μⱼ ≥ 0
  ④ Complementary slackness: μⱼ gⱼ(x*) = 0
     (either constraint is active gⱼ=0, or multiplier is 0)

LAGRANGE DUAL PROBLEM
  g(λ,μ) = min_x L(x, λ, μ)    (dual function — always concave)
  max_{λ,μ: μ≥0} g(λ,μ)        (dual problem)

WEAK DUALITY:    d* ≤ p*   always holds (dual ≤ primal optimal)
STRONG DUALITY:  d* = p*   holds when Slater's condition satisfied
  (for convex problems with a strictly feasible point)`,
                },
                {
                  order: 1, language: "text", label: "Coordinate descent & EM algorithm",
                  content: `COORDINATE DESCENT
  Minimise f(x₁,…,xₙ) by optimising one coordinate at a time:
  x_j^(t+1) = argmin_{x_j} f(x₁^(t+1),…,x_{j-1}^(t+1), x_j, x_{j+1}^(t),…)
  Guaranteed to converge for separable or smooth f
  Used in: Lasso (LARS/shooting), SVM (SMO), matrix factorisation

EM ALGORITHM (Expectation-Maximisation)
  For latent variable models:  p(X|θ) = ∫ p(X,Z|θ) dZ

  E-step:  Q(θ,θ^old) = E_{Z|X,θ^old}[log p(X,Z|θ)]
           Compute expected complete-data log-likelihood

  M-step:  θ^new = argmax_θ Q(θ, θ^old)

  ELBO interpretation:
  log p(X|θ) = Q(θ,θ^old) − E[log p(Z|X,θ)] + H(q)
  EM maximises a lower bound → log p(X|θ) non-decreasing

CONVERGENCE:  EM converges to a local maximum
  Each step increases or maintains log p(X|θ)
  Not guaranteed global maximum (sensitive to initialisation)

APPLICATIONS
  Gaussian Mixture Models (GMM)
  Hidden Markov Models (HMM — Baum-Welch)
  Probabilistic PCA, Factor Analysis
  Handling missing data`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created ML Math cheatsheet: ${mlmath.name} (${mlmath.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
