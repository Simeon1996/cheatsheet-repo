import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({
    where: { name: "Algebra", userId: null },
  });

  const algebra = await prisma.category.create({
    data: {
      name: "Algebra",
      icon: "∑",
      color: "indigo",
      description:
        "Algebra and equations cheatsheet — arithmetic identities, exponents, logarithms, polynomials, systems of equations, sequences, inequalities, and complex numbers",
      isPublic: true,
      snippets: {
        create: [
          // ── Arithmetic & Number Properties ────────────────────────────────────
          {
            title: "Arithmetic & Number Properties",
            description: "Fundamental laws, divisibility, primes, GCD, LCM, and absolute value",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Fundamental laws",
                  content: `FUNDAMENTAL LAWS
────────────────────────────────────────────────────────────────
Commutative      a + b = b + a              a · b = b · a
Associative     (a + b) + c = a + (b + c)  (a · b) · c = a · (b · c)
Distributive     a(b + c) = ab + ac
Identity         a + 0 = a                  a · 1 = a
Inverse          a + (−a) = 0               a · (1/a) = 1    (a ≠ 0)
Zero product     a · 0 = 0
Double negation  −(−a) = a
Sign rules       (−a)(−b) = ab              (−a)(b) = −ab

FRACTION ARITHMETIC
  a/b + c/d = (ad + bc) / bd
  a/b − c/d = (ad − bc) / bd
  a/b · c/d = ac / bd
  (a/b) ÷ (c/d) = (a/b) · (d/c) = ad / bc

  Simplify: a/b = (a÷k)/(b÷k)   for any common factor k

DIVISIBILITY RULES
  Div by 2  → last digit even
  Div by 3  → digit sum divisible by 3
  Div by 4  → last two digits divisible by 4
  Div by 5  → ends in 0 or 5
  Div by 6  → divisible by both 2 and 3
  Div by 8  → last three digits divisible by 8
  Div by 9  → digit sum divisible by 9
  Div by 10 → ends in 0`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Primes, GCD, LCM & absolute value",
                  content: `PRIMES
  A prime has exactly two distinct positive divisors: 1 and itself.
  Primes: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97 …
  Every integer n > 1 has a unique prime factorisation (Fundamental Theorem of Arithmetic).

  Example: 360 = 2³ · 3² · 5

GCD (Greatest Common Divisor) / HCF
  GCD(a, b) — largest integer dividing both a and b.
  Euclidean algorithm:  GCD(a, b) = GCD(b, a mod b)   until b = 0
  Example: GCD(48, 18) = GCD(18, 12) = GCD(12, 6) = GCD(6, 0) = 6

LCM (Least Common Multiple)
  LCM(a, b) = |a · b| / GCD(a, b)
  Example: LCM(12, 18) = 216 / 6 = 36

  GCD(a,b) · LCM(a,b) = |a · b|

ABSOLUTE VALUE
  |a|  =  a   if a ≥ 0
        −a   if a < 0

  |a · b|   = |a| · |b|
  |a + b|   ≤ |a| + |b|          (triangle inequality)
  |a − b|   ≥ | |a| − |b| |      (reverse triangle inequality)
  |a|²      = a²
  |a|       = √(a²)
  √(a²)     = |a|                 (not a, since a may be negative)

  Distance between a and b on number line:  d = |a − b|`,
                },
              ],
            },
          },
          // ── Exponents & Radicals ──────────────────────────────────────────────
          {
            title: "Exponents & Radicals",
            description: "All exponent laws, radical rules, and rationalising the denominator",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Exponent laws",
                  content: `EXPONENT LAWS  (a, b > 0;  m, n ∈ ℝ)
────────────────────────────────────────────────────────────────
Product rule        aᵐ · aⁿ  = aᵐ⁺ⁿ
Quotient rule       aᵐ / aⁿ  = aᵐ⁻ⁿ
Power of a power   (aᵐ)ⁿ    = aᵐⁿ
Power of a product (ab)ⁿ    = aⁿbⁿ
Power of a quotient(a/b)ⁿ   = aⁿ/bⁿ

Zero exponent       a⁰       = 1               (a ≠ 0)
Negative exponent   a⁻ⁿ      = 1/aⁿ
Negative base       (−a)ⁿ    = aⁿ   if n even
                              = −aⁿ  if n odd

Fractional exponent aᵐ/ⁿ     = ⁿ√(aᵐ) = (ⁿ√a)ᵐ
                    a¹/²     = √a
                    a¹/ⁿ     = ⁿ√a

COMMON MISTAKES
  (a + b)²  ≠ a² + b²    →  (a + b)² = a² + 2ab + b²
  √(a + b)  ≠ √a + √b
  (−2)²     = 4           but   −2² = −4   (order of operations!)`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Radical rules & rationalisation",
                  content: `RADICAL RULES  (a, b ≥ 0)
────────────────────────────────────────────────────────────────
Product         √a · √b     = √(ab)
Quotient        √a / √b     = √(a/b)             (b ≠ 0)
Power           (√a)²       = a
Simplify        √(a²b)      = a√b                (a ≥ 0)
Index law       ᵐ√(ⁿ√a)     = ᵐⁿ√a
Addition        k√a + j√a   = (k+j)√a            (same radicand only)
                √2 + √3     ≠ √5                 (different radicands)

RATIONALISING THE DENOMINATOR
  Single radical:
    k / √a  =  k√a / a        (multiply by √a/√a)

  Conjugate method (binomial):
    k / (√a + √b)  =  k(√a − √b) / (a − b)     (multiply by conjugate)
    k / (√a − √b)  =  k(√a + √b) / (a − b)

  Example:
    3 / (√5 + √2)
    = 3(√5 − √2) / (5 − 2)
    = 3(√5 − √2) / 3
    = √5 − √2

CONVERTING BETWEEN FORMS
  ⁿ√(aᵐ) = aᵐ/ⁿ
  a³/⁴    = ⁴√(a³)
  √a      = a^(1/2)
  1/√a    = a^(−1/2)`,
                },
              ],
            },
          },
          // ── Logarithms ────────────────────────────────────────────────────────
          {
            title: "Logarithms",
            description: "Definition, all log laws, change of base, natural log, and solving log equations",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Definition & laws",
                  content: `DEFINITION
  log_b(x) = y   ⟺   bʸ = x          (b > 0, b ≠ 1, x > 0)

  log without base  → log₁₀  (common log)
  ln                → log_e   (natural log, e ≈ 2.71828)
  lg                → log₂   (binary log, used in CS)

FUNDAMENTAL IDENTITIES
  log_b(b)    = 1               b¹ = b
  log_b(1)    = 0               b⁰ = 1
  log_b(bˣ)  = x               inverse
  b^(log_b x) = x               inverse

LOGARITHM LAWS  (b > 0, b ≠ 1, x > 0, y > 0)
────────────────────────────────────────────────────────────────
Product         log_b(xy)   = log_b(x) + log_b(y)
Quotient        log_b(x/y)  = log_b(x) − log_b(y)
Power           log_b(xⁿ)   = n · log_b(x)
Root            log_b(ⁿ√x)  = log_b(x) / n

Change of base  log_b(x)    = log_k(x) / log_k(b)      (any valid base k)
                            = ln(x) / ln(b)
                            = log(x) / log(b)

Reciprocal      log_b(x)    = 1 / log_x(b)
Flip base/arg   log_b(a) · log_a(b) = 1

NATURAL LOG IDENTITIES
  ln(eˣ)    = x
  e^(ln x)  = x
  ln(1)     = 0
  ln(e)     = 1
  ln(x/y)   = ln x − ln y
  ln(xⁿ)    = n ln x`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Solving logarithmic & exponential equations",
                  content: `SOLVING EXPONENTIAL EQUATIONS
────────────────────────────────────────────────────────────────
Same base:   bˣ = bʸ  →  x = y
             2^(x+1) = 2³  →  x + 1 = 3  →  x = 2

Take log:    aˣ = c   →  x = log_a(c) = ln(c)/ln(a)
             3ˣ = 20  →  x = ln(20)/ln(3) ≈ 2.727

Substitution: treat uˣ or eˣ as a new variable
             e^(2x) − 3eˣ + 2 = 0
             Let u = eˣ  →  u² − 3u + 2 = 0
             (u−1)(u−2) = 0  →  u=1 or u=2
             eˣ = 1 → x=0;   eˣ = 2 → x = ln 2

SOLVING LOGARITHMIC EQUATIONS
────────────────────────────────────────────────────────────────
Convert to exponential form:
  log_b(x) = c   →  x = bᶜ
  log₂(x)  = 5   →  x = 2⁵ = 32

Combine logs, then convert:
  log(x) + log(x−3) = 1
  log(x(x−3))       = 1
  x(x−3)            = 10¹
  x² − 3x − 10      = 0
  (x−5)(x+2)        = 0  →  x=5 or x=−2
  Check domain: argument must be > 0
  x=−2 rejected (log of negative)  →  x = 5

Equations with ln:
  ln(2x+1) = 3   →  2x+1 = e³  →  x = (e³−1)/2 ≈ 9.54

DOMAIN RESTRICTIONS
  log_b(f(x)) requires f(x) > 0
  Always check solutions against domain constraints.`,
                },
              ],
            },
          },
          // ── Algebraic Identities ──────────────────────────────────────────────
          {
            title: "Algebraic Identities & Factoring",
            description: "Expansion identities, factoring patterns, and the factor/remainder theorems",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Expansion identities",
                  content: `SQUARE & CUBE EXPANSIONS
────────────────────────────────────────────────────────────────
(a + b)²      = a² + 2ab + b²
(a − b)²      = a² − 2ab + b²
(a + b)(a − b)= a² − b²              (difference of squares)
(a + b)³      = a³ + 3a²b + 3ab² + b³
(a − b)³      = a³ − 3a²b + 3ab² − b³
a³ + b³       = (a + b)(a² − ab + b²)    (sum of cubes)
a³ − b³       = (a − b)(a² + ab + b²)    (difference of cubes)

GENERAL BINOMIAL EXPANSION  (n ∈ ℕ)
  (a + b)ⁿ = Σ_{k=0}^{n} C(n,k) · aⁿ⁻ᵏ · bᵏ

  where  C(n,k) = n! / (k!(n−k)!)  (binomial coefficient)

  (a + b)⁰ = 1
  (a + b)¹ = a + b
  (a + b)² = a² + 2ab + b²
  (a + b)³ = a³ + 3a²b + 3ab² + b³
  (a + b)⁴ = a⁴ + 4a³b + 6a²b² + 4ab³ + b⁴

PASCAL'S TRIANGLE (coefficients)
       1
      1 1
     1 2 1
    1 3 3 1
   1 4 6 4 1
  1 5 10 10 5 1

USEFUL IDENTITIES
  (a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca
  a² + b²      = (a+b)² − 2ab
  a³ + b³ + c³ − 3abc = (a+b+c)(a²+b²+c²−ab−bc−ca)`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Factoring techniques",
                  content: `FACTORING TECHNIQUES (in order of attempt)
────────────────────────────────────────────────────────────────
1. GCF (Greatest Common Factor)
     6x³ + 9x²  =  3x²(2x + 3)

2. Difference of squares
     a² − b²  =  (a+b)(a−b)
     4x² − 25 =  (2x+5)(2x−5)

3. Perfect square trinomial
     a² + 2ab + b²  =  (a+b)²
     a² − 2ab + b²  =  (a−b)²
     x² + 6x + 9    =  (x+3)²

4. Trinomial (leading coeff = 1)
     x² + bx + c  =  (x+p)(x+q)
     where  p + q = b  and  p · q = c
     x² + 5x + 6  =  (x+2)(x+3)    [2+3=5, 2·3=6]

5. Trinomial (leading coeff ≠ 1) — AC method
     ax² + bx + c:  find two numbers m,n where m·n = ac  and  m+n = b
     2x² + 7x + 3
     ac = 6;  find m,n: m·n=6, m+n=7  →  m=6, n=1
     2x² + 6x + x + 3  =  2x(x+3) + 1(x+3)  =  (2x+1)(x+3)

6. Grouping (4 terms)
     x³ + 2x² + 3x + 6  =  x²(x+2) + 3(x+2)  =  (x²+3)(x+2)

7. Sum / difference of cubes
     a³ + b³  =  (a+b)(a²−ab+b²)
     a³ − b³  =  (a−b)(a²+ab+b²)

FACTOR THEOREM
  (x − r) is a factor of polynomial P(x)  ⟺  P(r) = 0

REMAINDER THEOREM
  When P(x) is divided by (x − r), remainder = P(r)`,
                },
              ],
            },
          },
          // ── Linear Equations & Inequalities ──────────────────────────────────
          {
            title: "Linear Equations & Inequalities",
            description: "Solving linear equations, inequalities, absolute value equations, and interval notation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Linear equations",
                  content: `LINEAR EQUATION  ax + b = c   (a ≠ 0)
  Solve:  x = (c − b) / a

STANDARD FORMS
  Slope-intercept:  y = mx + b          m = slope, b = y-intercept
  Point-slope:      y − y₁ = m(x − x₁)
  Standard form:    Ax + By = C
  Two-point:        m = (y₂ − y₁)/(x₂ − x₁)

  Parallel lines:      same slope,  m₁ = m₂
  Perpendicular lines: m₁ · m₂ = −1   (negative reciprocal slopes)
  Horizontal line:     y = k           slope = 0
  Vertical line:       x = k           slope undefined

SLOPE
  m = rise/run = (y₂ − y₁)/(x₂ − x₁)

  Positive m  → line rises left to right
  Negative m  → line falls left to right
  m = 0       → horizontal
  undefined   → vertical

DISTANCE & MIDPOINT
  Distance:  d = √[(x₂−x₁)² + (y₂−y₁)²]
  Midpoint:  M = ((x₁+x₂)/2 , (y₁+y₂)/2)`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Inequalities & absolute value",
                  content: `LINEAR INEQUALITY RULES
────────────────────────────────────────────────────────────────
  Add/subtract same value to both sides → inequality sign unchanged
  Multiply/divide by positive            → inequality sign unchanged
  Multiply/divide by NEGATIVE            → FLIP the inequality sign!

  2x − 3 > 7   →   2x > 10   →   x > 5
  −3x < 12     →   x > −4    (divided by −3, sign flipped)

COMPOUND INEQUALITIES
  "And" (intersection):  a < x < b        both conditions true
  "Or"  (union):         x < a or x > b   at least one true

INTERVAL NOTATION
  (a, b)   open:     a < x < b
  [a, b]   closed:   a ≤ x ≤ b
  (a, b]   half:     a < x ≤ b
  [a, ∞)             x ≥ a
  (−∞, b)            x < b
  (−∞, ∞)            all real numbers ℝ

ABSOLUTE VALUE EQUATIONS
  |x| = a   →  x = a  or  x = −a          (a ≥ 0)
  |x| = −a  →  no solution                 (a > 0)

  |2x − 3| = 7
    2x − 3 = 7   →  x = 5
    2x − 3 = −7  →  x = −2

ABSOLUTE VALUE INEQUALITIES
  |x| < a   ⟺  −a < x < a    (a > 0)      ["less-than" → AND → sandwich]
  |x| > a   ⟺  x < −a or x > a            ["greater-than" → OR → two rays]
  |x| ≤ a   ⟺  −a ≤ x ≤ a
  |x| ≥ a   ⟺  x ≤ −a or x ≥ a

  |2x + 1| < 5  →  −5 < 2x+1 < 5  →  −6 < 2x < 4  →  −3 < x < 2`,
                },
              ],
            },
          },
          // ── Quadratic Equations ───────────────────────────────────────────────
          {
            title: "Quadratic Equations",
            description: "Quadratic formula, discriminant, Vieta's formulas, vertex form, and completing the square",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Solving quadratics",
                  content: `STANDARD FORM:  ax² + bx + c = 0   (a ≠ 0)

QUADRATIC FORMULA
  x = [−b ± √(b² − 4ac)] / (2a)

DISCRIMINANT  Δ = b² − 4ac
  Δ > 0  →  two distinct real roots
  Δ = 0  →  one repeated real root  x = −b/(2a)
  Δ < 0  →  two complex conjugate roots  (no real solutions)

COMPLETING THE SQUARE
  ax² + bx + c = 0
  Step 1:  x² + (b/a)x = −c/a
  Step 2:  x² + (b/a)x + (b/2a)² = −c/a + (b/2a)²
  Step 3:  (x + b/2a)² = (b² − 4ac) / (4a²)
  Step 4:  x = −b/2a ± √(b² − 4ac) / (2a)

VERTEX FORM:  y = a(x − h)² + k
  Vertex: (h, k)
  h = −b/(2a)
  k = c − b²/(4a) = f(h)

  Opens upward  if a > 0  (minimum at vertex)
  Opens downward if a < 0 (maximum at vertex)

STANDARD ↔ VERTEX ↔ FACTORED FORMS
  Standard:   ax² + bx + c
  Vertex:     a(x − h)² + k
  Factored:   a(x − r₁)(x − r₂)   where r₁, r₂ are roots`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Vieta's formulas & complex roots",
                  content: `VIETA'S FORMULAS  (roots r₁, r₂ of ax² + bx + c = 0)
  r₁ + r₂  = −b/a       (sum of roots)
  r₁ · r₂  =  c/a       (product of roots)

  Reconstruct equation from roots:
    x² − (r₁+r₂)x + r₁r₂ = 0

  Example: roots are 3 and −5
    x² − (3+(−5))x + (3·(−5)) = 0
    x² + 2x − 15 = 0    ✓

VIETA'S FOR DEGREE n POLYNOMIAL
  r₁+r₂+…+rₙ       = −aₙ₋₁ / aₙ
  r₁r₂+r₁r₃+…      =  aₙ₋₂ / aₙ
  r₁r₂…rₙ          = (−1)ⁿ a₀ / aₙ

COMPLEX / IMAGINARY NUMBERS
  i = √(−1)         i² = −1         i³ = −i         i⁴ = 1
  Powers cycle:  i¹=i, i²=−1, i³=−i, i⁴=1, i⁵=i, …

  Complex number:  z = a + bi   (a = real part, b = imaginary part)
  Conjugate:       z̄ = a − bi
  Modulus:         |z| = √(a² + b²)
  Argument:        θ = arctan(b/a)

  Addition:    (a+bi) + (c+di) = (a+c) + (b+d)i
  Subtraction: (a+bi) − (c+di) = (a−c) + (b−d)i
  Multiply:    (a+bi)(c+di) = (ac−bd) + (ad+bc)i
  Divide:      (a+bi)/(c+di) = (a+bi)(c−di) / (c²+d²)

  Complex roots always come in conjugate pairs.
  If r = p + qi is a root, then r̄ = p − qi is also a root.`,
                },
              ],
            },
          },
          // ── Polynomials ───────────────────────────────────────────────────────
          {
            title: "Polynomials",
            description: "Degree, long division, synthetic division, rational root theorem, and end behaviour",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Polynomial division & theorems",
                  content: `POLYNOMIAL LONG DIVISION
  Divide  P(x)  by  D(x):
    P(x) = D(x) · Q(x) + R(x)
    where  deg R < deg D

  P(x)/D(x) = Q(x) + R(x)/D(x)

SYNTHETIC DIVISION  (divide by x − r)
  Divide  x³ − 6x² + 11x − 6  by  (x − 2):

  Coefficients: 1  −6   11  −6
  r = 2:
         |  1  −6   11  −6
       2 |     2   −8    6
         ─────────────────
            1  −4    3   0   ← remainder = 0

  Quotient: x² − 4x + 3 = (x−1)(x−3)
  Roots: x = 1, 2, 3   ✓

RATIONAL ROOT THEOREM
  For aₙxⁿ + … + a₀ = 0  (integer coefficients):
  All rational roots p/q (lowest terms) satisfy:
    p divides a₀   (constant term)
    q divides aₙ   (leading coefficient)

  Example: 2x³ − x² − 7x + 6
    p ∈ {±1, ±2, ±3, ±6}   q ∈ {±1, ±2}
    Candidates: ±1, ±2, ±3, ±6, ±1/2, ±3/2

FACTOR & REMAINDER THEOREMS
  Remainder when P(x) ÷ (x−r):   R = P(r)
  (x−r) is a factor of P(x):      P(r) = 0

FUNDAMENTAL THEOREM OF ALGEBRA
  Every non-constant polynomial of degree n has exactly n
  roots in ℂ (counting multiplicity).`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "End behaviour & multiplicity",
                  content: `END BEHAVIOUR  y = aₙxⁿ + …
────────────────────────────────────────────────────────────────
          Leading coeff aₙ > 0         aₙ < 0
  n even   x→+∞: y→+∞               y→−∞
            x→−∞: y→+∞               y→−∞
  n odd    x→+∞: y→+∞               y→−∞
            x→−∞: y→−∞               y→+∞

  Even degree: both ends point same direction (U or ∩ shape)
  Odd degree:  ends point opposite directions (S shape)

ROOT MULTIPLICITY
  Root r with multiplicity m in P(x) = (x−r)ᵐ · Q(x):
    m odd  → graph crosses x-axis at r   (changes sign)
    m even → graph touches x-axis at r   (bounces, same sign)
    m = 1  → crosses and changes sign (simple root)
    m = 2  → tangent to axis (double root)
    m = 3  → crosses with inflection     (cubic root)

ZEROS & FACTORS RELATIONSHIP
  P(r) = 0   ⟺   r is a root   ⟺   (x−r) is a factor

DEGREE OF A POLYNOMIAL
  Degree = highest power with non-zero coefficient
  Sum:     deg(P+Q) ≤ max(deg P, deg Q)
  Product: deg(P·Q) = deg P + deg Q

NUMBER OF TURNING POINTS
  Polynomial of degree n has at most (n−1) turning points`,
                },
              ],
            },
          },
          // ── Systems of Equations ──────────────────────────────────────────────
          {
            title: "Systems of Equations",
            description: "Substitution, elimination, Cramer's rule, matrix method, and classifying systems",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "2×2 and 3×3 systems",
                  content: `2×2 LINEAR SYSTEM  (two equations, two unknowns)
────────────────────────────────────────────────────────────────
SUBSTITUTION METHOD
  Solve one equation for one variable, substitute into the other.
  { 2x + y = 7         y = 7 − 2x
  { x − y  = 2    →   x − (7−2x) = 2  →  3x = 9  →  x=3, y=1

ELIMINATION (addition) METHOD
  Multiply equations to align coefficients, then add/subtract.
  { 3x + 2y = 12       × 2  →  6x + 4y = 24
  { 2x − 4y = 8        × 1  →  2x − 4y =  8
                              ─────────────────
                               8x      = 32  →  x=4, y=0

CRAMER'S RULE (2×2)
  { ax + by = e       |a b|
  { cx + dy = f   D = |c d| = ad − bc

  x = |e b| / D = (ed − bf) / D
      |f d|

  y = |a e| / D = (af − ce) / D
      |c f|

  D ≠ 0 → unique solution
  D = 0, consistent  → infinitely many solutions
  D = 0, inconsistent → no solution

3×3 SYSTEM — back-substitution after row reduction (Gaussian elimination)
  Write augmented matrix [A|b], apply row operations:
    Rᵢ ↔ Rⱼ         (swap rows)
    kRᵢ → Rᵢ        (scale row by k ≠ 0)
    Rᵢ + kRⱼ → Rᵢ   (add multiple of one row to another)
  Reduce to upper-triangular (row echelon) form, then back-substitute.`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Classifying systems & matrix method",
                  content: `CLASSIFYING SYSTEMS
────────────────────────────────────────────────────────────────
Consistent & Independent    → exactly one solution    (lines intersect)
Consistent & Dependent      → infinite solutions      (lines coincide)
Inconsistent                → no solution             (lines parallel)

Matrix test (for n×n system  Ax = b):
  det(A) ≠ 0  →  unique solution   x = A⁻¹b
  det(A) = 0  →  either 0 or ∞ solutions

2×2 INVERSE MATRIX
  A  = |a b|       A⁻¹ = (1/det A) · |d  −b|
       |c d|                           |−c   a|

  det(A) = ad − bc

  A⁻¹ exists only if det(A) ≠ 0

MATRIX SOLUTION
  Ax = b   →   x = A⁻¹b

CRAMER'S RULE (3×3)
  x₁ = det(A₁)/det(A)
  x₂ = det(A₂)/det(A)
  x₃ = det(A₃)/det(A)
  where Aᵢ = matrix A with i-th column replaced by b

3×3 DETERMINANT (cofactor expansion along row 1)
  |a₁ b₁ c₁|
  |a₂ b₂ c₂| = a₁(b₂c₃−b₃c₂) − b₁(a₂c₃−a₃c₂) + c₁(a₂b₃−a₃b₂)
  |a₃ b₃ c₃|`,
                },
              ],
            },
          },
          // ── Rational Expressions ──────────────────────────────────────────────
          {
            title: "Rational Expressions & Equations",
            description: "Simplifying, operations, partial fractions, and solving rational equations",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Operations on rational expressions",
                  content: `RATIONAL EXPRESSION:  P(x)/Q(x)   where Q(x) ≠ 0

DOMAIN
  Exclude all x values that make the denominator zero.
  (x²−4)/(x²−x−6)  →  factor: (x+2)(x−2)/((x−3)(x+2))
  Excluded: x = 3, x = −2

SIMPLIFYING (cancel common factors)
  (x²−4) / (x²−x−6)
  = (x+2)(x−2) / ((x+2)(x−3))
  = (x−2)/(x−3)       x ≠ −2, x ≠ 3

MULTIPLICATION
  (P/Q) · (R/S) = PR / QS      (then simplify)

DIVISION
  (P/Q) ÷ (R/S) = (P/Q) · (S/R) = PS / QR

ADDITION/SUBTRACTION (find LCD)
  P/Q + R/S  →  find LCD of Q and S
  = (PS + RQ) / QS            (if GCD(Q,S)=1)

  Example:
    3/(x+2) + 2/(x−1)
    LCD = (x+2)(x−1)
    = 3(x−1)/[(x+2)(x−1)] + 2(x+2)/[(x+2)(x−1)]
    = [3x−3 + 2x+4] / [(x+2)(x−1)]
    = (5x+1) / [(x+2)(x−1)]

COMPLEX FRACTIONS — multiply top and bottom by LCD
  (1/x + 1/y) / (1/x − 1/y)   ×  (xy/xy)
  = (y + x) / (y − x)`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Partial fraction decomposition",
                  content: `PARTIAL FRACTION DECOMPOSITION
Decomposes a proper rational function into simpler fractions.
(Degree of numerator < degree of denominator)

CASE 1 — Distinct linear factors
  P(x) / [(ax+b)(cx+d)]  =  A/(ax+b) + B/(cx+d)

  Example:
    (3x+1) / [(x+1)(x−2)]  =  A/(x+1) + B/(x−2)
    Multiply both sides by (x+1)(x−2):
    3x+1 = A(x−2) + B(x+1)
    x=2:   7 = 3B   →  B = 7/3
    x=−1: −2 = −3A  →  A = 2/3

CASE 2 — Repeated linear factors
  P(x) / (ax+b)²  =  A/(ax+b) + B/(ax+b)²

  P(x) / (ax+b)ⁿ  =  A₁/(ax+b) + A₂/(ax+b)² + … + Aₙ/(ax+b)ⁿ

CASE 3 — Irreducible quadratic factors
  P(x) / (ax²+bx+c)  =  (Ax+B) / (ax²+bx+c)

  (irreducible means b²−4ac < 0)

CASE 4 — Repeated irreducible quadratic
  P(x) / (ax²+bx+c)²  =  (Ax+B)/(ax²+bx+c) + (Cx+D)/(ax²+bx+c)²

IMPROPER FRACTION (deg num ≥ deg den)
  Perform polynomial long division first, then decompose remainder.

  (x³+2x) / (x²−1)
  = (x) + (3x)/(x²−1)         [after division]
  = x + A/(x+1) + B/(x−1)     [then decompose (3x)/(x²−1)]`,
                },
              ],
            },
          },
          // ── Sequences & Series ────────────────────────────────────────────────
          {
            title: "Sequences & Series",
            description: "Arithmetic and geometric sequences, series sums, sigma notation, and infinite series",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Arithmetic & geometric sequences",
                  content: `ARITHMETIC SEQUENCE  (constant difference d)
────────────────────────────────────────────────────────────────
  General term:    aₙ = a₁ + (n−1)d
  Recursive:       aₙ = aₙ₋₁ + d

  Common difference:  d = aₙ − aₙ₋₁ = (aₙ − a₁)/(n−1)

  Sum of n terms (arithmetic series):
    Sₙ = n(a₁ + aₙ)/2 = n/2 · [2a₁ + (n−1)d]

  Example:  3, 7, 11, 15, …  (a₁=3, d=4)
    a₁₀ = 3 + 9·4 = 39
    S₁₀ = 10(3+39)/2 = 210

GEOMETRIC SEQUENCE  (constant ratio r)
────────────────────────────────────────────────────────────────
  General term:   aₙ = a₁ · rⁿ⁻¹
  Recursive:      aₙ = aₙ₋₁ · r

  Common ratio:   r = aₙ / aₙ₋₁

  Sum of n terms (geometric series):
    Sₙ = a₁(1 − rⁿ)/(1 − r)     r ≠ 1
    Sₙ = n · a₁                  r = 1 (constant sequence)

  Infinite geometric series  (|r| < 1):
    S∞ = a₁ / (1 − r)

  Example:  2, 6, 18, 54, …  (a₁=2, r=3)
    a₅ = 2 · 3⁴ = 162
    S₅ = 2(1−3⁵)/(1−3) = 2(1−243)/(−2) = 242

  Example:  1 + 1/2 + 1/4 + …  (a₁=1, r=1/2)
    S∞ = 1/(1−1/2) = 2`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Sigma notation & key series sums",
                  content: `SIGMA NOTATION
────────────────────────────────────────────────────────────────
  Σ_{k=1}^{n} aₖ  =  a₁ + a₂ + … + aₙ

SIGMA RULES
  Σ (aₖ + bₖ) = Σaₖ + Σbₖ
  Σ c·aₖ      = c · Σaₖ
  Σ c         = c·n                (c constant, k from 1 to n)

KEY SUMMATION FORMULAS
  Σ_{k=1}^{n} 1        = n
  Σ_{k=1}^{n} k        = n(n+1)/2
  Σ_{k=1}^{n} k²       = n(n+1)(2n+1)/6
  Σ_{k=1}^{n} k³       = [n(n+1)/2]²
  Σ_{k=0}^{n} rᵏ       = (1−rⁿ⁺¹)/(1−r)    r ≠ 1
  Σ_{k=0}^{∞} rᵏ       = 1/(1−r)            |r| < 1

USEFUL SERIES
  e^x  = Σ xⁿ/n!  = 1 + x + x²/2! + x³/3! + …
  ln(1+x) = Σ (−1)ⁿ⁺¹ xⁿ/n  = x − x²/2 + x³/3 − …   |x| ≤ 1
  sin x = Σ (−1)ⁿ x^(2n+1)/(2n+1)! = x − x³/6 + x⁵/120 − …
  cos x = Σ (−1)ⁿ x^(2n)/(2n)!     = 1 − x²/2 + x⁴/24 − …

ARITHMETIC VS GEOMETRIC: QUICK TEST
  Subtract consecutive terms → same → arithmetic
  Divide consecutive terms   → same → geometric
  Neither                    → neither (could be quadratic, Fibonacci, etc.)`,
                },
              ],
            },
          },
          // ── Functions ─────────────────────────────────────────────────────────
          {
            title: "Functions",
            description: "Domain, range, inverses, transformations, composition, and piecewise functions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Domain, range & inverses",
                  content: `FUNCTION  f: X → Y  maps each input x to exactly one output y.

DOMAIN — all valid inputs
  Restrictions to watch for:
    Denominator ≠ 0:    f(x) = 1/(x−3)         x ≠ 3
    Even root ≥ 0:      f(x) = √(x−4)           x ≥ 4
    Log argument > 0:   f(x) = ln(2x+1)         x > −1/2
    Combined:           f(x) = √(x−2)/(x−5)     x ≥ 2, x ≠ 5

RANGE — all possible outputs
  Find by solving y = f(x) for x and noting restrictions on y.
  f(x) = x²:           range [0, ∞)
  f(x) = √x:           range [0, ∞)
  f(x) = 1/x:          range ℝ \ {0}

INVERSE FUNCTION  f⁻¹
  f(f⁻¹(x)) = x    and    f⁻¹(f(x)) = x
  Domain of f⁻¹ = Range of f
  Range of f⁻¹  = Domain of f

  Finding f⁻¹:  replace f(x) with y, swap x and y, solve for y.
  f(x) = 2x+3   →   y=2x+3   →   x=2y+3   →   y=(x−3)/2
  f⁻¹(x) = (x−3)/2

  Graphically: f⁻¹ is the reflection of f across y = x.
  f has an inverse iff f is one-to-one (passes horizontal line test).

COMPOSITION
  (f ∘ g)(x) = f(g(x))         evaluate g first, then f
  (g ∘ f)(x) = g(f(x))         ← generally different
  f ∘ g ≠ g ∘ f  in general
  (f ∘ f⁻¹)(x) = x             identity`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Transformations & piecewise functions",
                  content: `FUNCTION TRANSFORMATIONS  (start from y = f(x))
────────────────────────────────────────────────────────────────
VERTICAL
  y = f(x) + k        shift UP k units
  y = f(x) − k        shift DOWN k units
  y = a·f(x)          stretch vertically by |a|    (a > 1)
  y = (1/a)·f(x)      compress vertically by |a|   (0 < a < 1)
  y = −f(x)           reflect across x-axis

HORIZONTAL  (note: opposite direction to what looks intuitive)
  y = f(x − h)        shift RIGHT h units
  y = f(x + h)        shift LEFT h units
  y = f(bx)           compress horizontally by b   (b > 1)
  y = f(x/b)          stretch horizontally by b
  y = f(−x)           reflect across y-axis

ORDER: horizontal shift → horizontal stretch → reflect → vertical stretch → vertical shift

COMBINED:  y = a · f(b(x − h)) + k
  h → horizontal shift right
  k → vertical shift up
  a → vertical stretch/flip
  b → horizontal compress/flip

PIECEWISE FUNCTIONS
       ┌ x²      if x < 0
f(x) = ┤ 2x+1   if 0 ≤ x < 3
       └ 7       if x ≥ 3

  f(−2) = (−2)² = 4
  f(2)  = 2(2)+1 = 5
  f(5)  = 7

EVEN & ODD FUNCTIONS
  Even:  f(−x) = f(x)        symmetric about y-axis   (x², cos x)
  Odd:   f(−x) = −f(x)       symmetric about origin   (x³, sin x)
  Test: substitute −x; simplify; compare.`,
                },
              ],
            },
          },
          // ── Inequalities (Non-linear) ─────────────────────────────────────────
          {
            title: "Non-linear Inequalities",
            description: "Solving quadratic, polynomial, and rational inequalities with sign charts",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Sign chart method",
                  content: `SIGN CHART METHOD (for polynomial & rational inequalities)
────────────────────────────────────────────────────────────────
1. Move everything to one side  (set > 0 or < 0)
2. Find all critical values  (zeros of numerator AND denominator)
3. Plot critical values on a number line
4. Test a point in each interval (pick an easy number)
5. Record sign (+/−) for each interval
6. Select intervals matching the inequality direction

QUADRATIC INEQUALITY EXAMPLE
  x² − x − 6 > 0
  Factor: (x−3)(x+2) > 0
  Critical values: x = 3, x = −2

  Intervals:   (−∞, −2)  |  (−2, 3)  |  (3, ∞)
  Test x=−3:  (−6)(−1)=+  → positive ✓
  Test x=0:   (−3)(2)=−   → negative ✗
  Test x=4:   (1)(6)=+    → positive ✓

  Solution: x < −2  or  x > 3   →   (−∞,−2) ∪ (3,∞)

RATIONAL INEQUALITY EXAMPLE
  (x+1)/(x−2) ≥ 0
  Critical values: x = −1  (zero of numerator)
                   x =  2  (zero of denominator) — EXCLUDED

  Intervals:  (−∞,−1) | [−1,2) | (2,∞)
  Test x=−2:  (−1)/(−4) = + ✓
  Test x=0:   (1)/(−2)  = − ✗
  Test x=3:   (4)/(1)   = + ✓

  Include x=−1 (numerator zero, ≥ allowed)
  Exclude x=2  (denominator zero, undefined)

  Solution: x ≤ −1  or  x > 2   →   (−∞,−1] ∪ (2,∞)

NOTE ON SIGN AT CRITICAL POINTS
  Strict inequality  (>, <):  open circles; exclude critical points
  Non-strict         (≥, ≤):  closed circles for zeros; still exclude denominator zeros`,
                },
              ],
            },
          },
          // ── Variation ─────────────────────────────────────────────────────────
          {
            title: "Variation & Word Equation Patterns",
            description: "Direct, inverse, joint, and combined variation; translating word problems",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Variation formulas",
                  content: `TYPES OF VARIATION
────────────────────────────────────────────────────────────────
DIRECT VARIATION
  y = kx          y varies directly as x
  y = kx²         y varies directly as x squared
  y = kxⁿ         y varies directly as the nth power of x

  k = y/x  (constant of variation)
  If x doubles, y doubles.

INVERSE VARIATION
  y = k/x         y varies inversely as x
  y = k/x²        y varies inversely as x squared

  xy = k  (product is constant)
  If x doubles, y halves.

JOINT VARIATION
  y = kxz         y varies jointly as x and z

COMBINED VARIATION
  y = kx/z        y varies directly as x and inversely as z

SOLVING VARIATION PROBLEMS
  Step 1: Write the variation equation (identify type).
  Step 2: Substitute known values to find k.
  Step 3: Rewrite equation with k; solve for unknown.

  Example: y varies directly as x²; y=12 when x=2. Find y when x=5.
    y = kx²
    12 = k(4)  →  k = 3
    y = 3(25) = 75

COMMON WORD PROBLEM EQUATIONS
  Rate × Time = Distance          d = rt
  Rate × Time = Work done         W = rt  (combined: 1/t₁ + 1/t₂ = 1/T)
  Principal × Rate × Time = Interest   I = Prt   (simple interest)
  I = P(1 + r/n)^(nt) − P         (compound interest total interest)
  A = P(1 + r/n)^(nt)             (compound interest total amount)
  A = Peʳᵗ                         (continuous compound interest)`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Translating word problems",
                  content: `TRANSLATING WORDS TO ALGEBRA
────────────────────────────────────────────────────────────────
ADDITION / SUBTRACTION
  "sum of a and b"          →  a + b
  "more than"               →  +      ("5 more than x" = x + 5)
  "less than"               →  −      ("3 less than x" = x − 3  ← note order!)
  "exceeds by"              →  −
  "difference of a and b"   →  a − b
  "decreased/reduced by"    →  −

MULTIPLICATION / DIVISION
  "product of a and b"      →  ab
  "twice, triple, …"        →  2x, 3x, …
  "of"                      →  ×      ("30% of x" = 0.30x)
  "quotient of a and b"     →  a/b
  "per"                     →  ÷
  "ratio of a to b"         →  a/b

EQUALITY / INEQUALITY
  "is, equals, gives, yields"     →  =
  "is at least / not less than"   →  ≥
  "is at most / not more than"    →  ≤
  "exceeds"                       →  >
  "is less than"                  →  <

MIXTURE PROBLEMS
  Amount × Concentration = Quantity of substance
  Solve by setting up:
    (substance in sol 1) + (substance in sol 2) = (substance in mix)

AGE PROBLEMS
  Define current age; express past/future ages relative to it.
  Present age: x;  in 5 years: x+5;  3 years ago: x−3

NUMBER PROBLEMS
  Consecutive integers:         n, n+1, n+2
  Consecutive even/odd:         n, n+2, n+4   (n even or odd)
  Digits:  two-digit number =   10t + u   (t=tens, u=units)`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Algebra cheatsheet: ${algebra.name} (${algebra.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
