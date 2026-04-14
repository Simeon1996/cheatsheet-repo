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
    where: { name: "Statistics", userId: admin.id },
  });

  const stats = await prisma.category.create({
    data: {
      name: "Statistics",
      icon: "📊",
      color: "teal",
      description: "Probability theory, discrete and continuous distributions, descriptive statistics, hypothesis testing, confidence intervals, and regression",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Probability Fundamentals ──────────────────────────────────────
          {
            title: "Probability Fundamentals",
            description: "Axioms, conditional probability, independence, Bayes' theorem, and combinatorics",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Axioms & rules",
                  content: `KOLMOGOROV AXIOMS
  1. P(A) ≥ 0                        (non-negativity)
  2. P(Ω) = 1                        (normalisation)
  3. P(A ∪ B) = P(A) + P(B)          if A ∩ B = ∅  (additivity)

DERIVED RULES
  P(Aᶜ)       = 1 − P(A)
  P(∅)        = 0
  P(A ∪ B)    = P(A) + P(B) − P(A ∩ B)   (inclusion-exclusion)
  P(A)        ≤ P(B)   if A ⊆ B
  0 ≤ P(A)    ≤ 1

CONDITIONAL PROBABILITY
  P(A|B) = P(A ∩ B) / P(B),   P(B) > 0

MULTIPLICATION RULE
  P(A ∩ B)    = P(A|B) P(B) = P(B|A) P(A)
  P(A₁∩…∩Aₙ) = P(A₁) P(A₂|A₁) P(A₃|A₁,A₂) … (chain rule)

LAW OF TOTAL PROBABILITY
  If B₁,…,Bₙ partition Ω:
  P(A) = Σᵢ P(A|Bᵢ) P(Bᵢ)

BAYES' THEOREM
  P(B|A) = P(A|B) P(B) / P(A)
         = P(A|B) P(B) / Σᵢ P(A|Bᵢ) P(Bᵢ)

INDEPENDENCE
  A ⊥ B  ⟺  P(A ∩ B) = P(A) P(B)  ⟺  P(A|B) = P(A)
  Note: mutually exclusive ≠ independent`,
                },
                {
                  order: 1, language: "text", label: "Combinatorics",
                  content: `COUNTING RULES
  ─────────────────────────────────────────────────────
  Arrangement         Order?   Repeat?   Formula
  ─────────────────────────────────────────────────────
  Permutation         Yes      No        n! / (n−k)!
  Combination         No       No        C(n,k) = n! / (k!(n−k)!)
  Perm. w/ repetition Yes      Yes       nᵏ
  Comb. w/ repetition No       Yes       C(n+k−1, k)
  ─────────────────────────────────────────────────────

BINOMIAL COEFFICIENT
  C(n,k) = "n choose k" = n! / (k!(n−k)!)
  C(n,0) = C(n,n) = 1
  C(n,k) = C(n, n−k)                (symmetry)
  C(n,k) = C(n−1,k−1) + C(n−1,k)   (Pascal's rule)
  Σₖ C(n,k) = 2ⁿ

MULTINOMIAL COEFFICIENT
  n! / (k₁! k₂! … kₘ!)   where Σ kᵢ = n

STIRLING'S APPROXIMATION
  n! ≈ √(2πn) (n/e)ⁿ
  log(n!) ≈ n log n − n + ½ log(2πn)`,
                },
              ],
            },
          },
          // ── Descriptive Statistics ────────────────────────────────────────
          {
            title: "Descriptive Statistics",
            description: "Central tendency, spread, shape, and moments",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Central tendency & spread",
                  content: `MEASURES OF CENTRAL TENDENCY
  Mean (μ):     x̄ = (1/n) Σᵢ xᵢ
  Median:       middle value when sorted; average of middle two if n even
  Mode:         most frequent value
  Geometric mean: (x₁·x₂·…·xₙ)^(1/n) = exp((1/n) Σ log xᵢ)
  Harmonic mean:  n / Σ(1/xᵢ)

  Mode ≤ Median ≤ Mean  (for right-skewed distributions)

MEASURES OF SPREAD
  Range:       max − min
  Variance:    s² = (1/(n−1)) Σᵢ (xᵢ − x̄)²     (sample, Bessel's correction)
               σ² = (1/n) Σᵢ (xᵢ − μ)²           (population)
  Std dev:     s = √s²
  IQR:         Q3 − Q1   (interquartile range)
  MAD:         median of |xᵢ − median(x)|   (robust)
  CV:          σ/μ   (coefficient of variation — relative spread)

QUANTILES / PERCENTILES
  Q1 = 25th percentile,  Q2 = median,  Q3 = 75th percentile
  Outlier rule: < Q1 − 1.5·IQR   or   > Q3 + 1.5·IQR`,
                },
                {
                  order: 1, language: "text", label: "Moments & shape",
                  content: `MOMENTS
  kth raw moment:       μ'_k = E[Xᵏ]
  kth central moment:   μ_k  = E[(X−μ)ᵏ]
  μ'₁ = mean,  μ₂ = variance

SKEWNESS  (asymmetry)
  γ₁ = μ₃ / σ³  =  E[(X−μ)³] / σ³
  γ₁ > 0 : right (positive) skew  — tail on right, mean > median
  γ₁ < 0 : left  (negative) skew  — tail on left,  mean < median
  γ₁ = 0 : symmetric

  Sample skewness: g₁ = (n/((n−1)(n−2))) Σ((xᵢ−x̄)/s)³

KURTOSIS  (tail heaviness)
  γ₂ = μ₄ / σ⁴
  Excess kurtosis: κ = γ₂ − 3    (so Normal has κ = 0)
  κ > 0 : leptokurtic  (heavy tails, sharp peak — e.g. t-distribution)
  κ < 0 : platykurtic  (light tails, flat peak — e.g. uniform)
  κ = 0 : mesokurtic   (normal-like tails)

STANDARDISATION (Z-score)
  z = (x − μ) / σ
  Transforms any distribution to mean=0, std=1
  Useful for comparing values across different scales`,
                },
              ],
            },
          },
          // ── Discrete Distributions ────────────────────────────────────────
          {
            title: "Discrete Distributions",
            description: "Bernoulli, Binomial, Geometric, Negative Binomial, Poisson, and Hypergeometric",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Bernoulli & Binomial",
                  content: `BERNOULLI  Ber(p)  — single trial
  P(X=1) = p,    P(X=0) = 1−p
  E[X]   = p,    Var(X) = p(1−p)
  MGF:   1−p + p·eᵗ

BINOMIAL  B(n, p)  — n independent Bernoulli trials
  P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ,   k = 0,1,…,n
  E[X]   = np
  Var(X) = np(1−p)
  MGF:   (1−p + p·eᵗ)ⁿ
  Skewness: (1−2p)/√(np(1−p))
  Approx:  → N(np, np(1−p))     when n large, p not extreme
  Approx:  → Poisson(np)        when n large, p small, np moderate

GEOMETRIC  Geom(p)  — trials until first success
  P(X=k) = (1−p)^(k−1) p,   k = 1,2,3,…     (# trials)
  P(X=k) = (1−p)^k p,        k = 0,1,2,…     (# failures)
  E[X]   = 1/p     (trials version)
  Var(X) = (1−p)/p²
  Memoryless: P(X>m+n | X>m) = P(X>n)`,
                },
                {
                  order: 1, language: "text", label: "Poisson, NegBin & Hypergeometric",
                  content: `POISSON  Poi(λ)  — count of rare events in fixed interval
  P(X=k) = e⁻λ λᵏ / k!,   k = 0,1,2,…
  E[X]   = λ
  Var(X) = λ                    (mean = variance)
  MGF:   exp(λ(eᵗ−1))
  Sum:   Poi(λ₁) + Poi(λ₂) = Poi(λ₁+λ₂)
  Approx: → N(λ, λ)  for large λ

NEGATIVE BINOMIAL  NB(r, p)  — trials until r-th success
  P(X=k) = C(k−1, r−1) pʳ (1−p)^(k−r),   k = r, r+1,…
  E[X]   = r/p
  Var(X) = r(1−p)/p²
  NB(1,p) = Geometric(p)
  Overdispersed Poisson alternative (Var > Mean)

HYPERGEOMETRIC  — sampling without replacement
  Population N,  K successes,  n draws
  P(X=k) = C(K,k) C(N−K, n−k) / C(N,n)
  E[X]   = nK/N
  Var(X) = n(K/N)(1−K/N)(N−n)/(N−1)
  Finite population correction factor: (N−n)/(N−1)
  Approx: → B(n, K/N) when N large relative to n`,
                },
              ],
            },
          },
          // ── Continuous Distributions ──────────────────────────────────────
          {
            title: "Continuous Distributions",
            description: "Uniform, Normal, Exponential, Gamma, Beta, t, Chi-squared, and F",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Uniform, Normal & Exponential",
                  content: `UNIFORM  U(a, b)
  f(x) = 1/(b−a),      a ≤ x ≤ b
  F(x) = (x−a)/(b−a)
  E[X]   = (a+b)/2
  Var(X) = (b−a)²/12

NORMAL  N(μ, σ²)
  f(x) = (1/√(2πσ²)) exp(−(x−μ)²/(2σ²))
  E[X]   = μ,    Var(X) = σ²,   Median = Mode = μ
  Skew = 0,      Excess kurtosis = 0
  68-95-99.7 rule: P(|X−μ| ≤ kσ) for k=1,2,3
  Standard normal: Z = (X−μ)/σ ~ N(0,1)
  Sum: N(μ₁,σ₁²) + N(μ₂,σ₂²) = N(μ₁+μ₂, σ₁²+σ₂²)
  MGF: exp(μt + ½σ²t²)

  Key quantiles (standard normal):
  z₀.₉₀ = 1.282,  z₀.₉₅ = 1.645,  z₀.₉₇₅ = 1.960,  z₀.₉₉ = 2.326

EXPONENTIAL  Exp(λ)  — time between Poisson events
  f(x) = λe^{−λx},      x ≥ 0
  F(x) = 1 − e^{−λx}
  E[X]   = 1/λ,         Var(X) = 1/λ²
  Median = ln(2)/λ
  Memoryless: P(X>s+t | X>s) = P(X>t)
  Skewness = 2,  Excess kurtosis = 6
  Sum of n Exp(λ) → Gamma(n, λ)`,
                },
                {
                  order: 1, language: "text", label: "Gamma, Beta & Log-Normal",
                  content: `GAMMA  Γ(α, β)  — generalises exponential
  f(x) = (βᵅ/Γ(α)) xᵅ⁻¹ e^{−βx},   x > 0
  E[X]   = α/β,   Var(X) = α/β²
  Shape α > 0,  rate β > 0   (scale θ = 1/β also used)
  Γ(1, β) = Exp(β)
  Γ(n/2, ½) = χ²(n)   (chi-squared)
  Sum of independent Gamma(αᵢ,β) → Gamma(Σαᵢ, β)
  Γ(n) = (n−1)!   for integer n;   Γ(½) = √π

BETA  Beta(α, β)  — models probabilities, proportions
  f(x) = xᵅ⁻¹(1−x)^{β−1} / B(α,β),   0 < x < 1
  B(α,β) = Γ(α)Γ(β)/Γ(α+β)
  E[X]   = α/(α+β)
  Var(X) = αβ / ((α+β)²(α+β+1))
  Beta(1,1) = U(0,1)
  Conjugate prior for Binomial likelihood

LOG-NORMAL  LN(μ, σ²)  — X = e^Y, Y ~ N(μ,σ²)
  f(x) = (1/(xσ√(2π))) exp(−(ln x − μ)²/(2σ²))
  E[X]   = exp(μ + σ²/2)
  Var(X) = (e^{σ²}−1) exp(2μ+σ²)
  Median = e^μ,   Mode = exp(μ−σ²)
  Product of log-normals is log-normal`,
                },
                {
                  order: 2, language: "text", label: "t, Chi-squared & F distributions",
                  content: `CHI-SQUARED  χ²(k)  — sum of squared standard normals
  X = Z₁² + Z₂² + … + Zₖ²,   Zᵢ ~ N(0,1) i.i.d.
  f(x) = x^{k/2−1} e^{−x/2} / (2^{k/2} Γ(k/2)),   x > 0
  E[X]   = k,    Var(X) = 2k
  Skewness = √(8/k),   additive: χ²(m) + χ²(n) = χ²(m+n)
  Use: goodness-of-fit, test of independence, variance tests
  Sample variance: (n−1)s²/σ² ~ χ²(n−1)

STUDENT'S t  t(ν)  — small samples, unknown σ
  X = Z / √(V/ν),   Z~N(0,1), V~χ²(ν), independent
  f(x) = Γ((ν+1)/2)/(√(νπ) Γ(ν/2)) (1+x²/ν)^{−(ν+1)/2}
  E[X]   = 0            (ν > 1)
  Var(X) = ν/(ν−2)      (ν > 2)
  Heavier tails than Normal; t(ν) → N(0,1) as ν → ∞
  Use: t-tests (one-sample, two-sample, paired), regression coefficients

F  F(d₁, d₂)  — ratio of chi-squared variables
  X = (U/d₁)/(V/d₂),   U~χ²(d₁), V~χ²(d₂), independent
  E[X]   = d₂/(d₂−2)   (d₂ > 2)
  1/F(d₁,d₂) = F(d₂,d₁)     (reciprocal relationship)
  t(ν)² = F(1, ν)
  Use: ANOVA, comparing two variances, F-test in regression`,
                },
              ],
            },
          },
          // ── Random Variables & Expectation ────────────────────────────────
          {
            title: "Random Variables & Expectation",
            description: "CDF, PDF, PMF, transformations, MGF, and joint distributions",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "CDF, PDF, PMF & transformations",
                  content: `CDF (Cumulative Distribution Function)
  F(x) = P(X ≤ x)    — defined for all distributions
  F is non-decreasing, right-continuous, F(−∞)=0, F(+∞)=1
  P(a < X ≤ b) = F(b) − F(a)

PDF (Probability Density Function)  — continuous
  f(x) = dF(x)/dx ≥ 0,   ∫f(x)dx = 1
  P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx
  f(x) ≠ P(X=x)  — it's a density, not a probability!

PMF (Probability Mass Function)  — discrete
  p(x) = P(X=x) ≥ 0,   Σ p(x) = 1

TRANSFORMATION  Y = g(X)
  If g is monotone increasing:
  f_Y(y) = f_X(g⁻¹(y)) · |d/dy g⁻¹(y)|
  F_Y(y) = F_X(g⁻¹(y))

  General:  f_Y(y) = Σ f_X(xᵢ) / |g'(xᵢ)|  over all roots

QUANTILE FUNCTION (inverse CDF)
  F⁻¹(p) = inf{x : F(x) ≥ p}
  Simulate any distribution:  X = F⁻¹(U),  U ~ U(0,1)`,
                },
                {
                  order: 1, language: "text", label: "Joint distributions & covariance",
                  content: `JOINT DISTRIBUTION
  Joint CDF:     F(x,y) = P(X≤x, Y≤y)
  Joint PDF:     f(x,y),   ∫∫ f(x,y) dx dy = 1
  Marginal PDF:  f_X(x) = ∫ f(x,y) dy
  Conditional:   f(y|x) = f(x,y) / f_X(x)

INDEPENDENCE
  X ⊥ Y  ⟺  f(x,y) = f_X(x) f_Y(y)
          ⟺  F(x,y) = F_X(x) F_Y(y)
  Independent ⟹ Cov(X,Y) = 0   (but not vice versa)

COVARIANCE & CORRELATION
  Cov(X,Y) = E[XY] − E[X]E[Y]
  ρ(X,Y)   = Cov(X,Y)/(σ_X σ_Y) ∈ [−1, 1]
  ρ = ±1   ⟺  Y = aX + b  (perfect linear relationship)

BIVARIATE NORMAL  (X,Y) ~ N(μ, Σ)
  ρ = Cov(X,Y)/(σ_X σ_Y)
  Marginals: X~N(μ_X, σ_X²),  Y~N(μ_Y, σ_Y²)
  Conditional: Y|X ~ N(μ_Y + ρ(σ_Y/σ_X)(X−μ_X),  σ_Y²(1−ρ²))
  For bivariate normal: independent ⟺ ρ = 0`,
                },
                {
                  order: 2, language: "text", label: "MGF & characteristic function",
                  content: `MOMENT GENERATING FUNCTION (MGF)
  M_X(t) = E[e^{tX}] = Σₖ μ'_k tᵏ/k!    (if it exists near t=0)
  Moments: E[Xᵏ] = M_X^{(k)}(0)   (kth derivative at 0)
  Uniqueness: if M_X = M_Y then X and Y have same distribution
  Sum of independent: M_{X+Y}(t) = M_X(t) · M_Y(t)

  Common MGFs:
  N(μ,σ²):      exp(μt + σ²t²/2)
  Bin(n,p):     (1−p + pe^t)^n
  Poi(λ):       exp(λ(e^t − 1))
  Exp(λ):       λ/(λ−t),    t < λ
  Gamma(α,β):   (β/(β−t))^α, t < β

CHARACTERISTIC FUNCTION  (always exists)
  φ_X(t) = E[e^{itX}]   (Fourier transform of PDF)
  φ_X(t) = M_X(it)
  Inversion: f(x) = (1/2π) ∫ e^{−itx} φ_X(t) dt

CUMULANT GENERATING FUNCTION
  K_X(t) = log M_X(t)
  K_X'(0)  = mean,  K_X''(0) = variance
  K_X'''(0) = 3rd cumulant = 3rd central moment (skewness related)`,
                },
              ],
            },
          },
          // ── Limit Theorems ────────────────────────────────────────────────
          {
            title: "Limit Theorems",
            description: "Law of large numbers, central limit theorem, and convergence modes",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "LLN & CLT",
                  content: `LAW OF LARGE NUMBERS
  Weak LLN:   X̄ₙ →ᵖ μ   (convergence in probability)
              For any ε > 0:  P(|X̄ₙ − μ| > ε) → 0  as n → ∞

  Strong LLN: X̄ₙ →ᵃ·ˢ· μ  (almost sure convergence)
              P(lim_{n→∞} X̄ₙ = μ) = 1
              Requires E[|X|] < ∞

CENTRAL LIMIT THEOREM
  X₁,…,Xₙ i.i.d., E[Xᵢ]=μ, Var(Xᵢ)=σ²<∞
  √n (X̄ₙ − μ)/σ →ᵈ N(0,1)   as n → ∞
  Equivalently: X̄ₙ ≈ N(μ, σ²/n)   for large n
  Σᵢ Xᵢ ≈ N(nμ, nσ²)

  Practical rule: n ≥ 30 usually sufficient (less for symmetric distributions)
  For proportions: n·p ≥ 5  and  n·(1−p) ≥ 5

BERRY-ESSEEN THEOREM  (CLT error bound)
  sup_x |P(√n(X̄−μ)/σ ≤ x) − Φ(x)| ≤ C E[|X−μ|³] / (σ³ √n)
  C ≈ 0.4748   (best known constant)
  Error decreases as O(1/√n)`,
                },
                {
                  order: 1, language: "text", label: "Convergence modes & delta method",
                  content: `MODES OF CONVERGENCE (strongest → weakest)
  Almost sure (a.s.):   P(Xₙ → X) = 1
  In probability (p):   ∀ε>0, P(|Xₙ−X|>ε) → 0
  In Lᵖ (mean sq.):    E[|Xₙ−X|ᵖ] → 0
  In distribution (d):  F_Xₙ(x) → F_X(x) at continuity points

  a.s. ⟹ p ⟹ d   (implications one way only)
  Lᵖ  ⟹ p  for finite p

SLUTSKY'S THEOREM
  If Xₙ →ᵈ X  and  Yₙ →ᵖ c  (constant), then:
  Xₙ + Yₙ →ᵈ X + c
  Xₙ · Yₙ →ᵈ cX

CONTINUOUS MAPPING THEOREM
  If Xₙ →ᵈ X  and  g is continuous:
  g(Xₙ) →ᵈ g(X)

DELTA METHOD  (approximate distribution of g(X̄))
  √n(g(X̄ₙ) − g(μ)) →ᵈ N(0, σ² [g'(μ)]²)
  Var(g(X̄)) ≈ [g'(μ)]² σ²/n

  Multivariate delta method:
  √n(g(X̄ₙ) − g(μ)) →ᵈ N(0, ∇g(μ)ᵀ Σ ∇g(μ))`,
                },
              ],
            },
          },
          // ── Hypothesis Testing ────────────────────────────────────────────
          {
            title: "Hypothesis Testing",
            description: "Null/alternative hypotheses, p-values, Type I/II errors, power, and common tests",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Framework & error types",
                  content: `HYPOTHESIS TESTING FRAMEWORK
  H₀: null hypothesis    (status quo, assumed true until evidence against)
  H₁: alternative hypothesis (what we want to show)

  Test statistic T = function of sample data
  Reject H₀ when T falls in rejection region (critical region)

  p-value = P(observing data at least as extreme | H₀ true)
  Reject H₀ if p-value < α (significance level, typically 0.05)

ERROR TYPES
  ────────────────────────────────────────────────────
               H₀ true         H₀ false
  Reject H₀   Type I error α   Correct (Power = 1−β)
  Fail reject  Correct          Type II error β
  ────────────────────────────────────────────────────

  α = P(Type I error)  = significance level = P(reject H₀ | H₀ true)
  β = P(Type II error) = P(fail to reject H₀ | H₁ true)
  Power = 1−β = P(reject H₀ | H₁ true)   — want this large

  Decreasing α increases β (trade-off for fixed n)
  Increasing n decreases both α and β simultaneously

EFFECT SIZE  (practical vs statistical significance)
  Cohen's d = (μ₁ − μ₂) / σ_pooled
  Small: d≈0.2,  Medium: d≈0.5,  Large: d≈0.8`,
                },
                {
                  order: 1, language: "text", label: "Common tests",
                  content: `ONE-SAMPLE t-TEST  (unknown σ)
  H₀: μ = μ₀
  T = (x̄ − μ₀) / (s/√n) ~ t(n−1)   under H₀

TWO-SAMPLE t-TEST  (equal variances)
  H₀: μ₁ = μ₂
  T = (x̄₁ − x̄₂) / (sₚ √(1/n₁ + 1/n₂)) ~ t(n₁+n₂−2)
  sₚ² = ((n₁−1)s₁² + (n₂−1)s₂²) / (n₁+n₂−2)   (pooled variance)

WELCH'S t-TEST  (unequal variances)
  T = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)
  df ≈ (s₁²/n₁ + s₂²/n₂)² / ((s₁²/n₁)²/(n₁−1) + (s₂²/n₂)²/(n₂−1))

PAIRED t-TEST
  dᵢ = x₁ᵢ − x₂ᵢ,   T = d̄ / (sᵈ/√n) ~ t(n−1)

Z-TEST FOR PROPORTIONS  (large n)
  H₀: p = p₀
  Z = (p̂ − p₀) / √(p₀(1−p₀)/n) ~ N(0,1)

CHI-SQUARED TEST OF INDEPENDENCE
  T = Σᵢⱼ (Oᵢⱼ − Eᵢⱼ)² / Eᵢⱼ ~ χ²((r−1)(c−1))
  Eᵢⱼ = (row total × col total) / grand total

F-TEST FOR EQUALITY OF VARIANCES
  F = s₁²/s₂² ~ F(n₁−1, n₂−1)   under H₀: σ₁² = σ₂²`,
                },
                {
                  order: 2, language: "text", label: "Multiple testing & non-parametric",
                  content: `MULTIPLE COMPARISONS PROBLEM
  Running m tests at level α, expected false positives = mα
  Family-wise error rate (FWER) = P(at least one false positive)

BONFERRONI CORRECTION
  Reject Hᵢ if pᵢ < α/m
  Controls FWER ≤ α   (conservative)

BENJAMINI-HOCHBERG (FDR control)
  Sort p-values: p₍₁₎ ≤ p₍₂₎ ≤ … ≤ p₍ₘ₎
  Find largest k where p₍ₖ₎ ≤ (k/m)·q
  Reject all H₍₁₎,…,H₍ₖ₎
  Controls FDR = E[false positives / total positives] ≤ q

NON-PARAMETRIC TESTS  (no distribution assumptions)
  ─────────────────────────────────────────────────────────
  Parametric          Non-parametric equivalent
  ─────────────────────────────────────────────────────────
  1-sample t-test     Wilcoxon signed-rank test
  2-sample t-test     Mann-Whitney U test
  Paired t-test       Wilcoxon signed-rank test
  1-way ANOVA         Kruskal-Wallis test
  Pearson correlation Spearman / Kendall correlation
  ─────────────────────────────────────────────────────────
  Sign test:  counts signs of (xᵢ − μ₀), uses Binomial(n, 0.5)`,
                },
              ],
            },
          },
          // ── Confidence Intervals ──────────────────────────────────────────
          {
            title: "Confidence Intervals",
            description: "Construction, interpretation, and common CI formulas",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Interpretation & construction",
                  content: `DEFINITION
  A 95% CI means: if we repeated the experiment many times,
  95% of the constructed intervals would contain the true parameter.
  NOT: "95% probability the parameter is in this interval"  (it's fixed!)

GENERAL FORM
  Point estimate  ±  critical value × standard error
  θ̂ ± z_{α/2} · SE(θ̂)     (large sample, Normal)
  θ̂ ± t_{α/2, ν} · SE(θ̂)  (small sample, t-distribution)

MARGIN OF ERROR
  E = z_{α/2} · σ/√n
  Required sample size for margin E:  n = (z_{α/2} · σ / E)²

RELATIONSHIP TO HYPOTHESIS TESTING
  95% CI excludes μ₀  ⟺  reject H₀: μ=μ₀ at α=0.05 (two-sided)
  A (1−α)×100% CI corresponds to a level-α two-sided test

COMMON CRITICAL VALUES
  90% CI:  z = 1.645
  95% CI:  z = 1.960
  99% CI:  z = 2.576`,
                },
                {
                  order: 1, language: "text", label: "CI formulas for common parameters",
                  content: `MEAN (σ known)
  x̄ ± z_{α/2} · σ/√n

MEAN (σ unknown, small n)
  x̄ ± t_{α/2, n−1} · s/√n

DIFFERENCE OF MEANS (equal variances)
  (x̄₁−x̄₂) ± t_{α/2, n₁+n₂−2} · sₚ √(1/n₁+1/n₂)

PROPORTION (large n, Normal approx)
  p̂ ± z_{α/2} √(p̂(1−p̂)/n)
  Wilson interval (better for small n or extreme p):
  (p̂ + z²/2n ± z√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n)

VARIANCE (Normal population)
  ((n−1)s²/χ²_{α/2, n−1},  (n−1)s²/χ²_{1−α/2, n−1})

BOOTSTRAP CI  (non-parametric, general purpose)
  1. Resample with replacement B times → θ̂₁*,…,θ̂_B*
  2. Percentile CI: (θ̂*_{[α/2]}, θ̂*_{[1−α/2]})
  3. BCa (bias-corrected accelerated): adjusts for bias & skewness`,
                },
              ],
            },
          },
          // ── Regression & Correlation ──────────────────────────────────────
          {
            title: "Regression & Correlation",
            description: "Linear regression, OLS, ANOVA table, residuals, and correlation measures",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Simple & multiple linear regression",
                  content: `SIMPLE LINEAR REGRESSION
  Model:   Y = β₀ + β₁X + ε,   ε ~ N(0, σ²)

  OLS estimates:
  β̂₁ = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²  =  Cov(X,Y)/Var(X)
  β̂₀ = ȳ − β̂₁ x̄

  SE(β̂₁) = σ̂ / √(Σ(xᵢ−x̄)²),   σ̂² = SSE/(n−2)
  t-test: T = β̂₁/SE(β̂₁) ~ t(n−2)

MULTIPLE LINEAR REGRESSION
  Model:   Y = Xβ + ε,   ε ~ N(0, σ²I)
  OLS:     β̂ = (XᵀX)⁻¹Xᵀy
  Fitted:  ŷ = Xβ̂ = Hy,  H = X(XᵀX)⁻¹Xᵀ (hat matrix)
  Residuals: e = y − ŷ = (I−H)y
  σ̂² = SSE/(n−p−1)   (p predictors)

GAUSS-MARKOV THEOREM
  Under OLS assumptions (L, I, N, E — linear, independence,
  no multicollinearity, equal variance):
  β̂_OLS is BLUE: Best Linear Unbiased Estimator`,
                },
                {
                  order: 1, language: "text", label: "ANOVA table & model fit",
                  content: `ANOVA DECOMPOSITION  (Total = Regression + Residual)
  SST = Σ(yᵢ−ȳ)²        df = n−1
  SSR = Σ(ŷᵢ−ȳ)²        df = p
  SSE = Σ(yᵢ−ŷᵢ)²       df = n−p−1
  SST = SSR + SSE

  ──────────────────────────────────────────────────────────────
  Source      SS     df      MS = SS/df     F = MSR/MSE
  ──────────────────────────────────────────────────────────────
  Regression  SSR    p       MSR            F ~ F(p, n−p−1)
  Residual    SSE    n−p−1   MSE=σ̂²
  Total       SST    n−1
  ──────────────────────────────────────────────────────────────

COEFFICIENT OF DETERMINATION
  R² = SSR/SST = 1 − SSE/SST ∈ [0,1]
  Adjusted R² = 1 − (SSE/(n−p−1))/(SST/(n−1))   (penalises extra predictors)

CORRELATION COEFFICIENTS
  Pearson r:   r = Cov(X,Y)/(s_X s_Y) ∈ [−1,1]   (linear relationship)
  r² = R² in simple linear regression

  Spearman ρ:  Pearson r of ranks   (monotonic relationship, robust)
  Kendall τ:   (concordant − discordant pairs) / C(n,2)`,
                },
              ],
            },
          },
          // ── Bayesian Statistics ────────────────────────────────────────────
          {
            title: "Bayesian Statistics",
            description: "Prior/posterior, credible intervals, Bayesian vs frequentist, and conjugate analysis",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Bayesian inference",
                  content: `BAYESIAN FRAMEWORK
  posterior ∝ likelihood × prior
  p(θ|x) ∝ p(x|θ) p(θ)

  Posterior mean = optimal estimator under squared loss
  Posterior median = optimal under absolute loss
  MAP = posterior mode = optimal under 0-1 loss

CREDIBLE INTERVAL  (vs. frequentist CI)
  A 95% credible interval [a,b] means:
  P(θ ∈ [a,b] | data) = 0.95    ← parameter IS random in Bayes
  Compare: frequentist CI is about the interval, not the parameter

HIGHEST POSTERIOR DENSITY (HPD) INTERVAL
  Narrowest interval containing (1−α) of posterior mass
  Every point inside has higher density than every point outside

CONJUGATE ANALYSIS EXAMPLES
  Beta-Binomial:
    Prior:     θ ~ Beta(α, β)
    Likelihood: x|θ ~ Bin(n, θ)
    Posterior:  θ|x ~ Beta(α+x, β+n−x)
    Post. mean: (α+x)/(α+β+n)   — weighted average of prior mean and MLE

  Normal-Normal (known σ²):
    Prior:     μ ~ N(μ₀, τ₀²)
    Likelihood: x̄|μ ~ N(μ, σ²/n)
    Posterior:  μ|x̄ ~ N(μₙ, τₙ²)
    τₙ² = (1/τ₀² + n/σ²)⁻¹         (posterior precision = sum of precisions)
    μₙ  = τₙ²(μ₀/τ₀² + nx̄/σ²)     (precision-weighted average)`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Statistics cheatsheet: ${stats.name} (${stats.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
