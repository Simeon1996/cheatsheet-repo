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
    where: { name: "React", userId: admin.id },
  });

  const react = await prisma.category.create({
    data: {
      name: "React",
      icon: "⚛️",
      color: "cyan",
      description: "React hooks, patterns, performance, context, refs and modern best practices",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Component Fundamentals ────────────────────────────────────────────
          {
            title: "Component Fundamentals",
            description: "Function components, props, JSX patterns and children",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "Function component with typed props",
                  content: `import type { ReactNode, CSSProperties } from "react";

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
}

export function Button({
  label,
  variant = "primary",
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      className={\`btn btn--\${variant}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children ?? label}
    </button>
  );
}`,
                },
                {
                  order: 1, language: "tsx", label: "JSX patterns — conditionals and lists",
                  content: `function Feed({ items, isLoading, error, currentUser }) {
  // Early returns keep JSX clean
  if (error)     return <ErrorBanner message={error.message} />;
  if (isLoading) return <Spinner />;
  if (!items.length) return <EmptyState />;

  return (
    <ul>
      {/* Conditional rendering */}
      {currentUser && <li>Welcome, {currentUser.name}!</li>}

      {/* Ternary */}
      {items.length > 0 ? (
        items.map((item) => (
          // key must be stable, unique, not the array index if list reorders
          <li key={item.id}>
            <span>{item.title}</span>
            {item.isPinned && <PinIcon />}
          </li>
        ))
      ) : (
        <li>No items</li>
      )}

      {/* Fragment shorthand to avoid extra div */}
      <>
        <li>A</li>
        <li>B</li>
      </>
    </ul>
  );
}`,
                },
                {
                  order: 2, language: "tsx", label: "Children patterns and render props",
                  content: `import type { ReactNode, ComponentProps } from "react";

// Accept any renderable children
function Card({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Spread native element props (polymorphic component)
interface TextProps extends ComponentProps<"p"> {
  as?: "p" | "span" | "div";
  size?: "sm" | "md" | "lg";
}

function Text({ as: Tag = "p", size = "md", className = "", ...rest }: TextProps) {
  return <Tag className={\`text text--\${size} \${className}\`} {...rest} />;
}

// Render prop
function Toggle({ render }: { render: (on: boolean, toggle: () => void) => ReactNode }) {
  const [on, setOn] = React.useState(false);
  return <>{render(on, () => setOn((prev) => !prev))}</>;
}

// Usage:
// <Toggle render={(on, toggle) => (
//   <button onClick={toggle}>{on ? "ON" : "OFF"}</button>
// )} />`,
                },
              ],
            },
          },
          // ── Core Hooks ────────────────────────────────────────────────────────
          {
            title: "Core Hooks",
            description: "useState, useEffect, useReducer and useId",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "useState — state and updater patterns",
                  content: `import { useState } from "react";

// Primitive state
const [count, setCount] = useState(0);
const [name,  setName]  = useState("");
const [open,  setOpen]  = useState(false);

// Functional update — use when new state depends on old state
setCount((prev) => prev + 1);
setOpen((prev) => !prev);

// Object state — always spread to avoid losing fields
const [form, setForm] = useState({ email: "", password: "" });
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

// Lazy initializer — runs once, avoids expensive computation on every render
const [data, setData] = useState(() => JSON.parse(localStorage.getItem("data") ?? "null"));

// Derived state — compute from existing state, don't duplicate
const [items, setItems] = useState<string[]>([]);
const isEmpty = items.length === 0;       // derived — no separate useState
const sorted  = [...items].sort();        // derived — compute in render`,
                },
                {
                  order: 1, language: "tsx", label: "useEffect — data fetching, subscriptions, cleanup",
                  content: `import { useState, useEffect } from "react";

// Run after every render
useEffect(() => { document.title = \`\${count} items\`; });

// Run once on mount
useEffect(() => {
  console.log("mounted");
  return () => console.log("unmounted"); // cleanup runs on unmount
}, []);

// Run when deps change
useEffect(() => {
  if (!userId) return;

  let cancelled = false;

  async function fetchUser() {
    const res  = await fetch(\`/api/users/\${userId}\`);
    const data = await res.json();
    if (!cancelled) setUser(data);
  }

  fetchUser();
  return () => { cancelled = true; }; // cancel stale updates
}, [userId]);

// Event listener with cleanup
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [onClose]);

// Rules: don't ignore the exhaustive-deps lint warning
// If a dep causes an infinite loop, check if the dep is stable`,
                },
                {
                  order: 2, language: "tsx", label: "useReducer — complex state logic",
                  content: `import { useReducer } from "react";

type State = { count: number; step: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "setStep"; payload: number }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment": return { ...state, count: state.count + state.step };
    case "decrement": return { ...state, count: state.count - state.step };
    case "setStep":   return { ...state, step: action.payload };
    case "reset":     return { count: 0, step: 1 };
    default:          return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });

  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      <input
        type="number"
        value={state.step}
        onChange={(e) => dispatch({ type: "setStep", payload: Number(e.target.value) })}
      />
    </>
  );
}`,
                },
              ],
            },
          },
          // ── useRef & useImperativeHandle ──────────────────────────────────────
          {
            title: "Refs",
            description: "useRef for DOM access, mutable values and forwardRef",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "useRef — DOM access and mutable values",
                  content: `import { useRef, useEffect } from "react";

// DOM ref — auto-assigned when element mounts
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus(); // focus on mount
  }, []);

  return <input ref={inputRef} type="search" />;
}

// Mutable value — survives re-renders, changing it does NOT trigger re-render
function Timer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [seconds, setSeconds] = useState(0);

  function start() {
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return <>{seconds}s <button onClick={start}>Start</button> <button onClick={stop}>Stop</button></>;
}

// Store previous value
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => { ref.current = value; });
  return ref.current;
}`,
                },
                {
                  order: 1, language: "tsx", label: "forwardRef and useImperativeHandle",
                  content: `import { forwardRef, useRef, useImperativeHandle } from "react";

// forwardRef — pass ref through to a DOM element
const FancyInput = forwardRef<HTMLInputElement, { label: string }>(
  ({ label }, ref) => (
    <label>
      {label}
      <input ref={ref} />
    </label>
  )
);
FancyInput.displayName = "FancyInput";

// Usage
const inputRef = useRef<HTMLInputElement>(null);
<FancyInput ref={inputRef} label="Email" />
inputRef.current?.focus();

// useImperativeHandle — expose custom API instead of raw DOM node
interface DialogHandle {
  open: () => void;
  close: () => void;
}

const Modal = forwardRef<DialogHandle, { children: ReactNode }>(
  ({ children }, ref) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      open:  () => setVisible(true),
      close: () => setVisible(false),
    }));

    if (!visible) return null;
    return <div className="modal">{children}</div>;
  }
);

// Usage
const modalRef = useRef<DialogHandle>(null);
modalRef.current?.open();`,
                },
              ],
            },
          },
          // ── useMemo, useCallback, memo ─────────────────────────────────────────
          {
            title: "Performance",
            description: "memo, useMemo, useCallback and useTransition",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "memo — skip re-renders when props unchanged",
                  content: `import { memo } from "react";

// Wrap component to skip re-render if props are shallowly equal
const Avatar = memo(function Avatar({ user }: { user: User }) {
  return <img src={user.avatarUrl} alt={user.name} />;
});

// Custom comparison function (use sparingly)
const Row = memo(
  function Row({ item }: { item: Item }) {
    return <tr><td>{item.name}</td></tr>;
  },
  (prevProps, nextProps) => prevProps.item.id === nextProps.item.id
);

// memo only helps when:
// 1. The component renders often
// 2. Props genuinely don't change between renders
// 3. The render is expensive
// Don't wrap every component — profile first`,
                },
                {
                  order: 1, language: "tsx", label: "useMemo and useCallback",
                  content: `import { useMemo, useCallback } from "react";

// useMemo — memoize an expensive computed value
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items] // only re-sort when items changes
);

const filteredUsers = useMemo(
  () => users.filter((u) => u.role === activeRole && u.name.includes(search)),
  [users, activeRole, search]
);

// useCallback — memoize a function (stable reference across renders)
// Needed when passing callbacks to memo'd children or as useEffect deps
const handleDelete = useCallback(
  async (id: string) => {
    await deleteItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  },
  [deleteItem] // recreate only when deleteItem changes
);

// When NOT to memoize:
// - Simple calculations (string concat, arithmetic) — overhead isn't worth it
// - Components that always re-render anyway (parent isn't memo'd)
// - Values that change every render (new object literals as deps)`,
                },
                {
                  order: 2, language: "tsx", label: "useTransition and useDeferredValue",
                  content: `import { useState, useTransition, useDeferredValue } from "react";

// useTransition — mark state updates as non-urgent
// UI stays responsive; React can interrupt the transition for urgent updates
function SearchPage() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value); // urgent — update input immediately

    startTransition(() => {
      // non-urgent — can be interrupted by typing
      setResults(expensiveSearch(e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleInput} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}

// useDeferredValue — defer an expensive re-render without controlling the update
function FilteredList({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  // deferredQuery lags behind query — list re-renders with lower priority
  const filtered = useMemo(() => expensiveFilter(deferredQuery), [deferredQuery]);
  return <List items={filtered} />;
}`,
                },
              ],
            },
          },
          // ── Context ───────────────────────────────────────────────────────────
          {
            title: "Context",
            description: "Share state across the tree without prop drilling",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "Context with typed hook and provider",
                  content: `import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextValue {
  user: User | null;
  login:  (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Custom hook — throws if used outside provider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(credentials: Credentials) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    setUser(data.user);
  }

  function logout() {
    setUser(null);
    fetch("/api/auth/logout", { method: "POST" });
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}`,
                },
                {
                  order: 1, language: "tsx", label: "Splitting context to prevent unnecessary re-renders",
                  content: `import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Split STATE and DISPATCH into separate contexts
// Components that only dispatch never re-render when state changes
const CountStateContext   = createContext<number>(0);
const CountDispatchContext = createContext<{
  increment: () => void;
  decrement: () => void;
} | null>(null);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);

  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={{ increment, decrement }}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

export const useCount         = () => useContext(CountStateContext);
export const useCountDispatch = () => {
  const ctx = useContext(CountDispatchContext);
  if (!ctx) throw new Error("useCountDispatch must be inside CounterProvider");
  return ctx;
};`,
                },
              ],
            },
          },
          // ── Custom Hooks ──────────────────────────────────────────────────────
          {
            title: "Custom Hooks",
            description: "Reusable logic extracted into custom hooks",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "useFetch — data fetching with loading and error state",
                  content: `import { useState, useEffect, useCallback } from "react";

interface FetchState<T> {
  data:      T | null;
  isLoading: boolean;
  error:     Error | null;
  refetch:   () => void;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [data,      setData]      = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<Error | null>(null);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json() as Promise<T>;
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [url, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}

// Usage
const { data: user, isLoading, error } = useFetch<User>(\`/api/users/\${id}\`);`,
                },
                {
                  order: 1, language: "tsx", label: "useLocalStorage, useDebounce, useMediaQuery",
                  content: `import { useState, useEffect, useCallback } from "react";

// useLocalStorage
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  }, [key]);

  return [value, set] as const;
}

// useDebounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// useMediaQuery
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// Usage
const isMobile = useMediaQuery("(max-width: 768px)");
const [theme, setTheme] = useLocalStorage("theme", "light");
const debouncedSearch = useDebounce(searchQuery, 300);`,
                },
                {
                  order: 2, language: "tsx", label: "useEventListener, useOnClickOutside, useLockBodyScroll",
                  content: `import { useEffect, useRef, type RefObject } from "react";

// useEventListener
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  element: EventTarget = window,
) {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);

  useEffect(() => {
    const listener = (e: Event) => savedHandler.current(e as WindowEventMap[K]);
    element.addEventListener(event, listener);
    return () => element.removeEventListener(event, listener);
  }, [event, element]);
}

// useOnClickOutside
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (e: MouseEvent | TouchEvent) => void,
) {
  useEventListener("mousedown", (e) => {
    if (!ref.current || ref.current.contains(e.target as Node)) return;
    handler(e);
  });
}

// useLockBodyScroll — prevent background scroll when modal is open
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [locked]);
}

// Usage
const menuRef = useRef<HTMLDivElement>(null);
useOnClickOutside(menuRef, () => setOpen(false));
useLockBodyScroll(isModalOpen);`,
                },
              ],
            },
          },
          // ── Patterns ──────────────────────────────────────────────────────────
          {
            title: "Patterns",
            description: "Error boundaries, Suspense, portals, compound components",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "Error Boundary",
                  content: `import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
    // reportErrorToSentry(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert">
          <p>Something went wrong.</p>
          <pre>{this.state.error?.message}</pre>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<p>Failed to load widget.</p>}>
  <ExpensiveWidget />
</ErrorBoundary>`,
                },
                {
                  order: 1, language: "tsx", label: "Suspense and lazy loading",
                  content: `import { Suspense, lazy } from "react";

// Code-split a component — bundle is loaded on demand
const Chart     = lazy(() => import("./Chart"));
const UserModal = lazy(() => import("./UserModal"));

// Wrap lazy components in Suspense
function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Chart data={data} />
    </Suspense>
  );
}

// Nested Suspense — different fallbacks for different parts
function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Header />
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
      <Suspense fallback={null}>
        <SidePanel />
      </Suspense>
    </Suspense>
  );
}`,
                },
                {
                  order: 2, language: "tsx", label: "Portal — render outside parent DOM",
                  content: `import { createPortal } from "react-dom";
import { useState, useEffect, useRef, type ReactNode } from "react";

function Modal({ isOpen, onClose, children }: {
  isOpen:   boolean;
  onClose:  () => void;
  children: ReactNode;
}) {
  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Renders into document.body, outside the React tree DOM-wise
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}`,
                },
                {
                  order: 3, language: "tsx", label: "Compound component pattern",
                  content: `import { createContext, useContext, useState, type ReactNode } from "react";

// Compound components share state implicitly via context
const TabsContext = createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Must be inside <Tabs>");
  return ctx;
}

function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist" className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  return (
    <button
      role="tab"
      aria-selected={active === id}
      onClick={() => setActive(id)}
    >
      {children}
    </button>
  );
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs();
  if (active !== id) return null;
  return <div role="tabpanel">{children}</div>;
}

// Attach as static properties
Tabs.List  = TabList;
Tabs.Tab   = Tab;
Tabs.Panel = TabPanel;

// Usage — clean, readable, no prop drilling
// <Tabs defaultTab="profile">
//   <Tabs.List>
//     <Tabs.Tab id="profile">Profile</Tabs.Tab>
//     <Tabs.Tab id="settings">Settings</Tabs.Tab>
//   </Tabs.List>
//   <Tabs.Panel id="profile"><ProfileForm /></Tabs.Panel>
//   <Tabs.Panel id="settings"><SettingsForm /></Tabs.Panel>
// </Tabs>`,
                },
              ],
            },
          },
          // ── Common Mistakes ───────────────────────────────────────────────────
          {
            title: "Common Mistakes & Fixes",
            description: "Stale closures, infinite loops, key misuse and batching",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "tsx", label: "Stale closure in useEffect",
                  content: `// ❌ Stale closure — count is always 0 inside the interval
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count captured from first render
  }, 1000);
  return () => clearInterval(id);
}, []); // empty deps — never re-runs

// ✅ Fix 1: functional update — no stale closure needed
useEffect(() => {
  const id = setInterval(() => {
    setCount((prev) => prev + 1); // always uses current value
  }, 1000);
  return () => clearInterval(id);
}, []);

// ✅ Fix 2: add dep (effect re-runs each time count changes)
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);

// ✅ Fix 3: useRef for stable mutable value
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);`,
                },
                {
                  order: 1, language: "tsx", label: "Infinite useEffect loops and object deps",
                  content: `// ❌ Infinite loop — new object created every render triggers effect
useEffect(() => {
  fetchData(options);
}, [options]); // options = { page: 1 } re-created each render

// ✅ Fix 1: primitive deps instead of object
useEffect(() => {
  fetchData({ page, sort });
}, [page, sort]);

// ✅ Fix 2: memoize the object
const options = useMemo(() => ({ page, sort }), [page, sort]);
useEffect(() => { fetchData(options); }, [options]);

// ❌ Infinite loop — setState in useEffect without dep guard
useEffect(() => {
  setData(processData(rawData)); // triggers re-render → effect runs → repeat
});

// ✅ Fix: add dep array
useEffect(() => {
  setData(processData(rawData));
}, [rawData]);

// ❌ Function recreated every render causes child re-render storm
<Child onUpdate={() => setCount((c) => c + 1)} />

// ✅ Fix: stable reference with useCallback
const handleUpdate = useCallback(() => setCount((c) => c + 1), []);
<Child onUpdate={handleUpdate} />`,
                },
                {
                  order: 2, language: "tsx", label: "Key prop mistakes and state reset",
                  content: `// ❌ Using index as key when list can reorder
items.map((item, index) => <Row key={index} item={item} />);
// React reuses DOM nodes — state in Row gets associated with wrong item

// ✅ Use stable, unique ID from data
items.map((item) => <Row key={item.id} item={item} />);

// key as a reset mechanism — change key to fully reset child state
// Useful when you want to reset a form or component on prop change
<UserForm key={userId} userId={userId} />
// Changing userId causes React to unmount old component and mount fresh one

// ❌ State initialised from prop — stale after prop changes
function Input({ defaultValue }) {
  const [value, setValue] = useState(defaultValue); // only uses initial render value
  ...
}

// ✅ Use key to reset
<Input key={userId} defaultValue={user.name} />

// ✅ Or use controlled component (parent owns state)`,
                },
                {
                  order: 3, language: "tsx", label: "State batching and flushSync",
                  content: `// React 18+ batches ALL state updates automatically
// (event handlers, setTimeout, fetch callbacks, promises)

function handleClick() {
  setA(1); // ⎤
  setB(2); // ⎥ batched → single re-render
  setC(3); // ⎦
}

// Before React 18, only event handler updates were batched.
// Now everything is batched — one fewer source of bugs.

// Force synchronous render — use sparingly (e.g. before reading layout)
import { flushSync } from "react-dom";

function handleAdd() {
  flushSync(() => {
    setItems((prev) => [...prev, newItem]);
  });
  // DOM is updated NOW — safe to measure it
  listRef.current?.lastElementChild?.scrollIntoView();
}`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created React cheatsheet: ${react.name} (${react.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
