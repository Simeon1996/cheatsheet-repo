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
    where: { name: "ML Formulas", userId: admin.id },
  });

  const ml = await prisma.category.create({
    data: {
      name: "ML Formulas",
      icon: "🧮",
      color: "purple",
      description: "Core machine learning formulas: loss functions, activation functions, regularisation, optimisers, metrics, probability, and neural network building blocks",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Loss Functions ────────────────────────────────────────────────
          {
            title: "Loss Functions",
            description: "MSE, MAE, Huber, cross-entropy, hinge, KL divergence, and their gradients",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Regression losses",
                  content: `import numpy as np

# Mean Squared Error  —  L = (1/n) Σ (y - ŷ)²
def mse(y, y_hat):
    return np.mean((y - y_hat) ** 2)

# Root MSE
def rmse(y, y_hat):
    return np.sqrt(mse(y, y_hat))

# Mean Absolute Error  —  L = (1/n) Σ |y - ŷ|
def mae(y, y_hat):
    return np.mean(np.abs(y - y_hat))

# Huber loss  —  quadratic near 0, linear for large errors
# L = 0.5*(y-ŷ)²          if |y-ŷ| ≤ δ
# L = δ*(|y-ŷ| - 0.5*δ)   otherwise
def huber(y, y_hat, delta=1.0):
    r = np.abs(y - y_hat)
    return np.where(r <= delta,
                    0.5 * r**2,
                    delta * (r - 0.5 * delta)).mean()

# Log-Cosh  —  log(cosh(y - ŷ))  — smooth approximation of MAE
def log_cosh(y, y_hat):
    return np.mean(np.log(np.cosh(y - y_hat)))`,
                },
                {
                  order: 1, language: "python", label: "Classification losses",
                  content: `# Binary Cross-Entropy  —  L = -[y*log(p) + (1-y)*log(1-p)]
def bce(y, p, eps=1e-15):
    p = np.clip(p, eps, 1 - eps)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))

# Categorical Cross-Entropy  —  L = -Σ y_k * log(p_k)
def cce(y_onehot, p, eps=1e-15):
    p = np.clip(p, eps, 1)
    return -np.mean(np.sum(y_onehot * np.log(p), axis=1))

# Hinge loss (SVM)  —  L = max(0, 1 - y * f(x))
def hinge(y, scores):
    # y in {-1, +1}
    return np.mean(np.maximum(0, 1 - y * scores))

# Squared Hinge
def squared_hinge(y, scores):
    return np.mean(np.maximum(0, 1 - y * scores) ** 2)

# Focal loss  —  downweights easy examples
# L = -α*(1-p)^γ * log(p)
def focal(y, p, alpha=0.25, gamma=2.0, eps=1e-15):
    p = np.clip(p, eps, 1 - eps)
    return -np.mean(
        alpha * (1 - p)**gamma * y * np.log(p) +
        (1 - alpha) * p**gamma * (1 - y) * np.log(1 - p)
    )`,
                },
                {
                  order: 2, language: "python", label: "KL divergence & others",
                  content: `# KL Divergence  —  KL(P || Q) = Σ P(x) * log(P(x)/Q(x))
# Measures how P differs from Q; not symmetric
def kl_divergence(p, q, eps=1e-15):
    p = np.clip(p, eps, 1)
    q = np.clip(q, eps, 1)
    return np.sum(p * np.log(p / q))

# Jensen-Shannon Divergence (symmetric, bounded [0,1])
def js_divergence(p, q):
    m = 0.5 * (p + q)
    return 0.5 * kl_divergence(p, m) + 0.5 * kl_divergence(q, m)

# Negative Log-Likelihood  —  NLL = -Σ log P(y_i | x_i; θ)
def nll(log_probs, targets):
    # log_probs: (n, c), targets: (n,) integer class indices
    n = len(targets)
    return -np.mean(log_probs[np.arange(n), targets])

# Contrastive loss (Siamese networks)
# L = y*d² + (1-y)*max(0, margin-d)²
def contrastive(d, y, margin=1.0):
    return np.mean(y * d**2 + (1 - y) * np.maximum(0, margin - d)**2)`,
                },
              ],
            },
          },
          // ── Activation Functions ──────────────────────────────────────────
          {
            title: "Activation Functions",
            description: "Sigmoid, tanh, ReLU variants, softmax, and their derivatives",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Core activations",
                  content: `import numpy as np

# Sigmoid  —  σ(x) = 1 / (1 + e^{-x})  range (0,1)
# σ'(x) = σ(x) * (1 - σ(x))
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_grad(x):
    s = sigmoid(x)
    return s * (1 - s)

# Tanh  —  range (-1, 1)
# tanh'(x) = 1 - tanh²(x)
def tanh(x):
    return np.tanh(x)

def tanh_grad(x):
    return 1 - np.tanh(x)**2

# Softmax  —  σ(z)_k = e^{z_k} / Σ e^{z_j}
# Subtract max for numerical stability
def softmax(x):
    e = np.exp(x - x.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)

# Log-softmax (numerically stable)
def log_softmax(x):
    x = x - x.max(axis=-1, keepdims=True)
    return x - np.log(np.exp(x).sum(axis=-1, keepdims=True))`,
                },
                {
                  order: 1, language: "python", label: "ReLU family",
                  content: `# ReLU  —  max(0, x)
# Gradient: 1 if x > 0, else 0
def relu(x):      return np.maximum(0, x)
def relu_grad(x): return (x > 0).astype(float)

# Leaky ReLU  —  max(αx, x),  α typically 0.01
def leaky_relu(x, alpha=0.01):
    return np.where(x > 0, x, alpha * x)

# ELU  —  x if x>0, α*(e^x - 1) if x≤0
def elu(x, alpha=1.0):
    return np.where(x > 0, x, alpha * (np.exp(x) - 1))

# SELU — self-normalising ELU
SELU_ALPHA  = 1.6732632423543772
SELU_LAMBDA = 1.0507009873554805
def selu(x):
    return SELU_LAMBDA * np.where(x > 0, x, SELU_ALPHA * (np.exp(x) - 1))

# GELU  —  x * Φ(x),  Φ = CDF of standard normal
# Approximation used in GPT/BERT
def gelu(x):
    return 0.5 * x * (1 + np.tanh(np.sqrt(2/np.pi) * (x + 0.044715 * x**3)))

# Swish  —  x * σ(x)  (self-gated)
def swish(x): return x * sigmoid(x)

# Mish  —  x * tanh(softplus(x))
def mish(x):  return x * np.tanh(np.log1p(np.exp(x)))`,
                },
              ],
            },
          },
          // ── Optimisers ────────────────────────────────────────────────────
          {
            title: "Optimisers",
            description: "SGD, Momentum, RMSProp, Adam, AdamW, and learning rate schedules",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "SGD & Momentum",
                  content: `# Vanilla SGD
# θ ← θ - η * ∇L(θ)
def sgd_update(theta, grad, lr=0.01):
    return theta - lr * grad

# SGD with Momentum
# v ← β*v - η*∇L(θ)
# θ ← θ + v
class SGDMomentum:
    def __init__(self, lr=0.01, momentum=0.9):
        self.lr = lr; self.beta = momentum; self.v = None

    def update(self, theta, grad):
        if self.v is None:
            self.v = np.zeros_like(theta)
        self.v = self.beta * self.v - self.lr * grad
        return theta + self.v

# Nesterov Accelerated Gradient (NAG)
# θ_look = θ + β*v
# v ← β*v - η*∇L(θ_look)
# θ ← θ + v
class NAG:
    def __init__(self, lr=0.01, momentum=0.9):
        self.lr = lr; self.beta = momentum; self.v = None

    def update(self, theta, grad_fn):
        if self.v is None:
            self.v = np.zeros_like(theta)
        theta_look = theta + self.beta * self.v
        grad = grad_fn(theta_look)
        self.v = self.beta * self.v - self.lr * grad
        return theta + self.v`,
                },
                {
                  order: 1, language: "python", label: "Adam & AdamW",
                  content: `# Adam  —  Adaptive Moment Estimation
# m ← β1*m + (1-β1)*g
# v ← β2*v + (1-β2)*g²
# m̂ = m/(1-β1^t),  v̂ = v/(1-β2^t)
# θ ← θ - η * m̂ / (√v̂ + ε)
class Adam:
    def __init__(self, lr=1e-3, beta1=0.9, beta2=0.999, eps=1e-8):
        self.lr = lr; self.b1 = beta1; self.b2 = beta2
        self.eps = eps; self.m = None; self.v = None; self.t = 0

    def update(self, theta, grad):
        if self.m is None:
            self.m = np.zeros_like(theta)
            self.v = np.zeros_like(theta)
        self.t += 1
        self.m = self.b1 * self.m + (1 - self.b1) * grad
        self.v = self.b2 * self.v + (1 - self.b2) * grad**2
        m_hat  = self.m / (1 - self.b1**self.t)
        v_hat  = self.v / (1 - self.b2**self.t)
        return theta - self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

# AdamW  —  Adam + decoupled weight decay
# θ ← θ*(1 - η*λ) - η * m̂ / (√v̂ + ε)
class AdamW(Adam):
    def __init__(self, *args, weight_decay=0.01, **kwargs):
        super().__init__(*args, **kwargs)
        self.wd = weight_decay

    def update(self, theta, grad):
        theta_new = super().update(theta, grad)
        return theta_new - self.lr * self.wd * theta   # weight decay`,
                },
                {
                  order: 2, language: "python", label: "Learning rate schedules",
                  content: `# Step decay  —  lr = lr0 * drop^floor(epoch/step)
def step_decay(epoch, lr0=0.1, drop=0.5, step=10):
    return lr0 * (drop ** (epoch // step))

# Exponential decay  —  lr = lr0 * e^{-k*t}
def exp_decay(t, lr0=0.1, k=0.01):
    return lr0 * np.exp(-k * t)

# Cosine annealing  —  lr = η_min + 0.5*(η_max-η_min)*(1+cos(πt/T))
def cosine_annealing(t, T, lr_min=1e-6, lr_max=0.1):
    return lr_min + 0.5 * (lr_max - lr_min) * (1 + np.cos(np.pi * t / T))

# Warm-up + cosine decay (used in transformers)
def warmup_cosine(t, T_warmup, T_total, lr_max=1e-3, lr_min=1e-6):
    if t < T_warmup:
        return lr_max * t / T_warmup
    progress = (t - T_warmup) / (T_total - T_warmup)
    return lr_min + 0.5 * (lr_max - lr_min) * (1 + np.cos(np.pi * progress))

# Cyclical LR (Smith 2017)
def cyclical_lr(t, step_size, lr_min=1e-4, lr_max=1e-2):
    cycle = np.floor(1 + t / (2 * step_size))
    x     = np.abs(t / step_size - 2 * cycle + 1)
    return lr_min + (lr_max - lr_min) * np.maximum(0, 1 - x)`,
                },
              ],
            },
          },
          // ── Regularisation ────────────────────────────────────────────────
          {
            title: "Regularisation",
            description: "L1/L2, elastic net, dropout, batch normalisation, and early stopping",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Weight penalties",
                  content: `# L2 regularisation (Ridge / weight decay)
# L_reg = L + λ * Σ w²
# Gradient addition: ∇w += 2λw
def l2_loss(weights, lam=1e-4):
    return lam * np.sum(weights**2)

def l2_grad(weights, lam=1e-4):
    return 2 * lam * weights

# L1 regularisation (Lasso)
# L_reg = L + λ * Σ |w|
# Gradient addition: ∇w += λ * sign(w)
def l1_loss(weights, lam=1e-4):
    return lam * np.sum(np.abs(weights))

def l1_grad(weights, lam=1e-4):
    return lam * np.sign(weights)

# Elastic Net  —  L_reg = L + λ1*Σ|w| + λ2*Σw²
def elastic_net(weights, lam1=1e-4, lam2=1e-4):
    return lam1 * np.sum(np.abs(weights)) + lam2 * np.sum(weights**2)

# Max-norm constraint (clip weight norms per neuron)
def max_norm(W, c=3.0):
    norms = np.linalg.norm(W, axis=0, keepdims=True)
    return W * np.minimum(1, c / (norms + 1e-8))`,
                },
                {
                  order: 1, language: "python", label: "Dropout & batch normalisation",
                  content: `# Dropout (inverted — scale at train time so no change at test)
# Forward pass: mask out units with probability p
def dropout(x, p=0.5, training=True):
    if not training:
        return x
    mask = (np.random.rand(*x.shape) > p) / (1 - p)
    return x * mask

# Batch Normalisation
# x̂ = (x - μ_B) / √(σ²_B + ε)
# y  = γ * x̂ + β
def batch_norm(x, gamma, beta, eps=1e-5):
    mu    = x.mean(axis=0)
    var   = x.var(axis=0)
    x_hat = (x - mu) / np.sqrt(var + eps)
    return gamma * x_hat + beta, mu, var, x_hat

# Layer Normalisation (normalise over features, not batch)
# Used in Transformers — independent of batch size
def layer_norm(x, gamma, beta, eps=1e-5):
    mu    = x.mean(axis=-1, keepdims=True)
    var   = x.var(axis=-1, keepdims=True)
    x_hat = (x - mu) / np.sqrt(var + eps)
    return gamma * x_hat + beta`,
                },
              ],
            },
          },
          // ── Evaluation Metrics ────────────────────────────────────────────
          {
            title: "Evaluation Metrics",
            description: "Classification, regression, ranking, and clustering metrics",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Classification metrics",
                  content: `# Confusion matrix quantities
# TP, TN, FP, FN from binary predictions
def confusion(y_true, y_pred):
    TP = np.sum((y_pred == 1) & (y_true == 1))
    TN = np.sum((y_pred == 0) & (y_true == 0))
    FP = np.sum((y_pred == 1) & (y_true == 0))
    FN = np.sum((y_pred == 0) & (y_true == 1))
    return TP, TN, FP, FN

# Accuracy  =  (TP + TN) / N
def accuracy(y_true, y_pred):
    return np.mean(y_true == y_pred)

# Precision  =  TP / (TP + FP)
def precision(y_true, y_pred):
    TP, _, FP, _ = confusion(y_true, y_pred)
    return TP / (TP + FP + 1e-9)

# Recall (Sensitivity, TPR)  =  TP / (TP + FN)
def recall(y_true, y_pred):
    TP, _, _, FN = confusion(y_true, y_pred)
    return TP / (TP + FN + 1e-9)

# F1 Score  =  2 * P * R / (P + R)  — harmonic mean
def f1(y_true, y_pred):
    P = precision(y_true, y_pred)
    R = recall(y_true, y_pred)
    return 2 * P * R / (P + R + 1e-9)

# F-beta  =  (1+β²) * P * R / (β²*P + R)
def f_beta(y_true, y_pred, beta=1.0):
    P = precision(y_true, y_pred)
    R = recall(y_true, y_pred)
    b2 = beta**2
    return (1 + b2) * P * R / (b2 * P + R + 1e-9)

# Matthews Correlation Coefficient  —  balanced even with class imbalance
def mcc(y_true, y_pred):
    TP, TN, FP, FN = confusion(y_true, y_pred)
    num = TP * TN - FP * FN
    den = np.sqrt((TP+FP)*(TP+FN)*(TN+FP)*(TN+FN))
    return num / (den + 1e-9)`,
                },
                {
                  order: 1, language: "python", label: "Regression & ranking metrics",
                  content: `# R² (coefficient of determination)
# R² = 1 - SS_res/SS_tot,  SS_res=Σ(y-ŷ)², SS_tot=Σ(y-ȳ)²
def r2(y, y_hat):
    ss_res = np.sum((y - y_hat) ** 2)
    ss_tot = np.sum((y - y.mean()) ** 2)
    return 1 - ss_res / (ss_tot + 1e-9)

# Mean Absolute Percentage Error
def mape(y, y_hat):
    return np.mean(np.abs((y - y_hat) / (y + 1e-9))) * 100

# ROC-AUC (trapezoidal approximation)
def roc_auc(y_true, scores):
    thresholds = np.sort(scores)[::-1]
    tprs, fprs = [0.0], [0.0]
    P = y_true.sum(); N = len(y_true) - P
    for t in thresholds:
        pred = (scores >= t).astype(int)
        TP, TN, FP, FN = confusion(y_true, pred)
        tprs.append(TP / P); fprs.append(FP / N)
    tprs.append(1.0); fprs.append(1.0)
    return np.trapz(tprs, fprs)

# NDCG — Normalized Discounted Cumulative Gain
def dcg(relevance, k=None):
    r = np.array(relevance[:k], dtype=float)
    return np.sum(r / np.log2(np.arange(2, r.size + 2)))

def ndcg(relevance, k=None):
    ideal = dcg(sorted(relevance, reverse=True), k)
    return dcg(relevance, k) / (ideal + 1e-9)`,
                },
              ],
            },
          },
          // ── Probability & Statistics ──────────────────────────────────────
          {
            title: "Probability & Statistics",
            description: "Bayes' theorem, distributions, MLE, MAP, and information theory",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Bayes & distributions",
                  content: `import numpy as np
from scipy import stats

# Bayes' Theorem:  P(A|B) = P(B|A) * P(A) / P(B)
# In ML context:  P(θ|X) ∝ P(X|θ) * P(θ)
#                 posterior ∝ likelihood × prior

# Gaussian (Normal)  —  N(μ, σ²)
# p(x) = (1/√(2πσ²)) * exp(-(x-μ)²/(2σ²))
def gaussian_pdf(x, mu=0, sigma=1):
    return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma)**2)

# Multivariate Gaussian
# p(x) = (1/((2π)^(d/2)|Σ|^(1/2))) * exp(-0.5*(x-μ)^T Σ^{-1} (x-μ))
def mvn_pdf(x, mu, Sigma):
    d = len(mu)
    diff = x - mu
    return (np.exp(-0.5 * diff @ np.linalg.inv(Sigma) @ diff) /
            np.sqrt((2 * np.pi)**d * np.linalg.det(Sigma)))

# Bernoulli  —  P(X=1) = p,  P(X=0) = 1-p
# Categorical  —  P(X=k) = p_k,  Σp_k = 1
# Softmax output IS a categorical distribution`,
                },
                {
                  order: 1, language: "python", label: "MLE, MAP & information theory",
                  content: `# Maximum Likelihood Estimation for Gaussian
# μ_MLE = (1/n) Σ x_i
# σ²_MLE = (1/n) Σ (x_i - μ)²
def gaussian_mle(x):
    return x.mean(), x.var()

# MAP estimate = MLE with prior (regularised)
# θ_MAP = argmax log P(X|θ) + log P(θ)
# With Gaussian prior on θ: same as L2 regularised loss

# Entropy  —  H(X) = -Σ P(x) log P(x)  (bits if log2, nats if ln)
def entropy(p):
    p = np.array(p)
    p = p[p > 0]          # ignore zero probabilities
    return -np.sum(p * np.log(p))

# Cross-entropy  —  H(P, Q) = -Σ P(x) log Q(x)
# = H(P) + KL(P||Q)  ≥ H(P)
def cross_entropy(p, q, eps=1e-15):
    q = np.clip(q, eps, 1)
    return -np.sum(p * np.log(q))

# Mutual Information  —  I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)
# I(X;Y) = KL(P(X,Y) || P(X)*P(Y))

# Perplexity  —  2^H(P,Q)  or  exp(H(P,Q))
# Lower is better; uniform over V words → perplexity = V
def perplexity(log_probs):
    return np.exp(-np.mean(log_probs))`,
                },
              ],
            },
          },
          // ── Neural Network Building Blocks ────────────────────────────────
          {
            title: "Neural Network Building Blocks",
            description: "Forward pass, backpropagation, weight init, and attention mechanism",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Forward pass & backpropagation",
                  content: `# Dense layer forward
# z = W·x + b,   a = f(z)
def dense_forward(x, W, b, activation=None):
    z = x @ W + b
    a = activation(z) if activation else z
    return a, z           # return z for backward pass

# Backpropagation through dense layer
# δ_prev = δ * f'(z)  (element-wise)
# dW = x^T · δ_prev
# db = sum(δ_prev, axis=0)
# dx = δ_prev · W^T
def dense_backward(delta, x, W, z, activation_grad=None):
    if activation_grad:
        delta = delta * activation_grad(z)
    dW = x.T @ delta
    db = delta.sum(axis=0)
    dx = delta @ W.T
    return dx, dW, db

# Chain rule (the heart of backprop)
# dL/dx = dL/dz * dz/dx
# For composition h = f(g(x)):
# dh/dx = (df/dg) * (dg/dx)`,
                },
                {
                  order: 1, language: "python", label: "Weight initialisation",
                  content: `# Zero init — bad! neurons learn same features
W = np.zeros((fan_in, fan_out))

# Random small values — okay for shallow nets
W = np.random.randn(fan_in, fan_out) * 0.01

# Xavier / Glorot (for tanh/sigmoid)
# Var(W) = 2 / (fan_in + fan_out)
def xavier(fan_in, fan_out):
    limit = np.sqrt(6 / (fan_in + fan_out))
    return np.random.uniform(-limit, limit, (fan_in, fan_out))

# He / Kaiming (for ReLU)
# Var(W) = 2 / fan_in
def he(fan_in, fan_out, mode="fan_in"):
    if mode == "fan_in":
        std = np.sqrt(2.0 / fan_in)
    else:
        std = np.sqrt(2.0 / fan_out)
    return np.random.randn(fan_in, fan_out) * std

# LeCun (for SELU)
# Var(W) = 1 / fan_in
def lecun(fan_in, fan_out):
    return np.random.randn(fan_in, fan_out) * np.sqrt(1.0 / fan_in)

# Orthogonal init (good for RNNs)
def orthogonal(shape, gain=1.0):
    flat = np.random.randn(*shape).reshape(shape[0], -1)
    U, _, Vt = np.linalg.svd(flat, full_matrices=False)
    W = U if U.shape == flat.shape else Vt
    return gain * W.reshape(shape)`,
                },
                {
                  order: 2, language: "python", label: "Scaled dot-product attention",
                  content: `# Attention(Q, K, V) = softmax(QK^T / √d_k) · V
#
# Q: queries  (seq_len, d_k)
# K: keys     (seq_len, d_k)
# V: values   (seq_len, d_v)
# Scale by √d_k to prevent vanishing gradients in softmax

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.swapaxes(-2, -1) / np.sqrt(d_k)   # (seq, seq)
    if mask is not None:
        scores = np.where(mask, scores, -1e9)          # -inf on masked positions
    weights = softmax(scores)                          # attention weights
    return weights @ V, weights                        # output + weights

# Multi-Head Attention
# MultiHead(Q,K,V) = Concat(head_1,...,head_h) · W_O
# head_i = Attention(Q·W_Qi, K·W_Ki, V·W_Vi)
def multi_head_attention(Q, K, V, W_Q, W_K, W_V, W_O, num_heads):
    d_model = Q.shape[-1]
    d_head  = d_model // num_heads
    heads = []
    for i in range(num_heads):
        q = Q @ W_Q[i]; k = K @ W_K[i]; v = V @ W_V[i]
        head, _ = scaled_dot_product_attention(q, k, v)
        heads.append(head)
    concat = np.concatenate(heads, axis=-1)
    return concat @ W_O`,
                },
              ],
            },
          },
          // ── Similarity & Distance ─────────────────────────────────────────
          {
            title: "Similarity & Distance",
            description: "Euclidean, cosine, Mahalanobis, Hamming, and kernel functions",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Distance metrics",
                  content: `# Euclidean distance  —  ||a - b||_2
def euclidean(a, b):
    return np.sqrt(np.sum((a - b)**2))

# Pairwise Euclidean (vectorised)
# ||a-b||² = ||a||² + ||b||² - 2*a·b
def pairwise_euclidean(A, B):
    aa = np.sum(A**2, axis=1, keepdims=True)
    bb = np.sum(B**2, axis=1, keepdims=True)
    return np.sqrt(aa + bb.T - 2 * A @ B.T)

# Manhattan (L1)  —  Σ |a_i - b_i|
def manhattan(a, b):
    return np.sum(np.abs(a - b))

# Minkowski  —  (Σ |a_i - b_i|^p)^(1/p)
def minkowski(a, b, p=2):
    return np.sum(np.abs(a - b)**p)**(1/p)

# Mahalanobis  —  √((a-b)^T Σ^{-1} (a-b))
# Accounts for correlations and scales
def mahalanobis(a, b, Sigma):
    diff = a - b
    return np.sqrt(diff @ np.linalg.inv(Sigma) @ diff)

# Hamming distance (for binary/categorical vectors)
def hamming(a, b):
    return np.mean(a != b)`,
                },
                {
                  order: 1, language: "python", label: "Similarity & kernels",
                  content: `# Cosine similarity  —  (a·b) / (||a||*||b||)  ∈ [-1, 1]
def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-9)

# Cosine distance  =  1 - cosine_similarity
def cosine_dist(a, b):
    return 1 - cosine_sim(a, b)

# Dot-product similarity (unnormalised)
def dot_sim(a, b):
    return np.dot(a, b)

# Kernel functions (used in SVMs, GP, etc.)

# Linear kernel
def linear_kernel(a, b):
    return np.dot(a, b)

# Polynomial kernel  —  (a·b + c)^d
def poly_kernel(a, b, c=1, d=3):
    return (np.dot(a, b) + c)**d

# RBF / Gaussian kernel  —  exp(-||a-b||² / (2σ²))
def rbf_kernel(a, b, sigma=1.0):
    return np.exp(-np.sum((a - b)**2) / (2 * sigma**2))

# Sigmoid kernel
def sigmoid_kernel(a, b, alpha=0.01, c=0):
    return np.tanh(alpha * np.dot(a, b) + c)`,
                },
              ],
            },
          },
          // ── Classic Algorithms ────────────────────────────────────────────
          {
            title: "Classic Algorithm Formulas",
            description: "Linear/logistic regression, SVM, k-means, PCA, and naive Bayes",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Linear & logistic regression",
                  content: `# Linear Regression
# Closed-form (Normal Equation):  θ = (X^T X)^{-1} X^T y
def linear_regression_closed(X, y):
    return np.linalg.pinv(X.T @ X) @ X.T @ y

# Prediction:  ŷ = X · θ
def lr_predict(X, theta):
    return X @ theta

# Logistic Regression
# P(y=1|x) = σ(w·x + b)
# Loss: BCE  — gradient: dL/dw = (1/n) X^T (ŷ - y)
def logistic_predict_proba(X, w, b):
    return 1 / (1 + np.exp(-(X @ w + b)))

def logistic_grad(X, y, w, b):
    y_hat = logistic_predict_proba(X, w, b)
    err   = y_hat - y
    dw = X.T @ err / len(y)
    db = err.mean()
    return dw, db

# Softmax Regression (multiclass)
# P(y=k|x) = exp(W_k·x) / Σ_j exp(W_j·x)
def softmax_regression(X, W):
    logits = X @ W.T
    return softmax(logits)`,
                },
                {
                  order: 1, language: "python", label: "PCA & k-means",
                  content: `# PCA — Principal Component Analysis
# 1. Centre the data
# 2. Compute covariance matrix: C = X^T X / (n-1)
# 3. Eigen-decompose C (or SVD of X)
# 4. Project: Z = X · V_k  (top k eigenvectors)
def pca(X, k):
    X_c = X - X.mean(axis=0)
    C   = X_c.T @ X_c / (len(X) - 1)
    vals, vecs = np.linalg.eigh(C)
    idx = np.argsort(vals)[::-1]
    V_k = vecs[:, idx[:k]]
    Z   = X_c @ V_k
    explained_variance_ratio = vals[idx[:k]] / vals.sum()
    return Z, V_k, explained_variance_ratio

# K-Means — Lloyd's algorithm
# Assignment:  c_i = argmin_k ||x_i - μ_k||²
# Update:      μ_k = mean of all x_i assigned to cluster k
def kmeans(X, k, max_iter=100, seed=42):
    rng = np.random.default_rng(seed)
    mu  = X[rng.choice(len(X), k, replace=False)]
    for _ in range(max_iter):
        dists   = pairwise_euclidean(X, mu)
        labels  = dists.argmin(axis=1)
        new_mu  = np.array([X[labels == j].mean(axis=0) for j in range(k)])
        if np.allclose(mu, new_mu): break
        mu = new_mu
    inertia = sum(np.sum((X[labels==j] - mu[j])**2) for j in range(k))
    return labels, mu, inertia`,
                },
              ],
            },
          },
          // ── Gradient Computation ──────────────────────────────────────────
          {
            title: "Gradient Computation",
            description: "Numerical gradients, gradient clipping, vanishing/exploding detection",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Numerical gradient checking",
                  content: `# Numerical gradient (central difference)
# df/dx ≈ [f(x+ε) - f(x-ε)] / (2ε)
def numerical_gradient(f, x, eps=1e-5):
    grad = np.zeros_like(x)
    it = np.nditer(x, flags=["multi_index"])
    while not it.finished:
        idx = it.multi_index
        orig = x[idx]
        x[idx] = orig + eps;  fp = f(x)
        x[idx] = orig - eps;  fm = f(x)
        grad[idx] = (fp - fm) / (2 * eps)
        x[idx] = orig
        it.iternext()
    return grad

# Gradient check — compare analytical vs numerical
def grad_check(f, grad_f, x, eps=1e-5, tol=1e-5):
    analytic  = grad_f(x)
    numeric   = numerical_gradient(f, x, eps)
    diff = np.abs(analytic - numeric)
    rel  = diff / (np.abs(analytic) + np.abs(numeric) + 1e-10)
    ok   = rel.max() < tol
    print(f"Max relative error: {rel.max():.2e} — {'PASS' if ok else 'FAIL'}")
    return ok`,
                },
                {
                  order: 1, language: "python", label: "Gradient clipping & diagnostics",
                  content: `# Gradient clipping by value
def clip_by_value(grad, min_val=-1.0, max_val=1.0):
    return np.clip(grad, min_val, max_val)

# Gradient clipping by global norm  (used in LSTMs / Transformers)
# Rescale all gradients so ||g|| ≤ max_norm
def clip_by_global_norm(grads, max_norm=1.0):
    global_norm = np.sqrt(sum(np.sum(g**2) for g in grads))
    scale = min(1.0, max_norm / (global_norm + 1e-6))
    return [g * scale for g in grads], global_norm

# Detect vanishing / exploding gradients
def gradient_stats(grads):
    for name, g in grads.items():
        print(f"{name:30s}  mean={g.mean():.2e}  "
              f"std={g.std():.2e}  max={np.abs(g).max():.2e}")

# Gradient norm per layer (useful for monitoring training)
def layer_grad_norms(grads):
    return {name: np.linalg.norm(g) for name, g in grads.items()}`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created ML Formulas cheatsheet: ${ml.name} (${ml.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
