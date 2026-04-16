import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({
    where: { name: "Design Patterns", userId: null },
  });

  const designPatterns = await prisma.category.create({
    data: {
      name: "Design Patterns",
      icon: "🧩",
      color: "purple",
      description:
        "GoF creational, structural, and behavioral patterns plus modern patterns — with TypeScript examples and when-to-use guidance",
      isPublic: true,
      snippets: {
        create: [
          // ── Overview ──────────────────────────────────────────────────────────
          {
            title: "Overview & SOLID Principles",
            description: "Pattern categories, SOLID, and the golden rules of OO design",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Pattern categories",
                  content: `# Design Pattern Categories (GoF)

## Creational — how objects are created
Singleton, Factory Method, Abstract Factory, Builder, Prototype

## Structural — how objects are composed
Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy

## Behavioral — how objects communicate
Chain of Responsibility, Command, Iterator, Mediator, Memento,
Observer, State, Strategy, Template Method, Visitor, Interpreter

# Quick Selection Guide
| Problem                                 | Pattern                   |
|-----------------------------------------|---------------------------|
| Need exactly one instance               | Singleton                 |
| Decouple object creation from use       | Factory Method            |
| Build complex objects step by step      | Builder                   |
| Incompatible interfaces                 | Adapter                   |
| Add behaviour without subclassing       | Decorator                 |
| Simplify a complex subsystem            | Facade                    |
| Swap algorithms at runtime              | Strategy                  |
| React to state changes                  | Observer                  |
| Object behaves differently per state    | State                     |
| Undo/redo support                       | Command + Memento         |
| Reduce coupling between many objects    | Mediator                  |`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "SOLID principles",
                  content: `# SOLID Principles

## S — Single Responsibility Principle
A class should have one reason to change.
Bad:  UserService handles auth + email + DB persistence
Good: AuthService | EmailService | UserRepository

## O — Open/Closed Principle
Open for extension, closed for modification.
Bad:  Add a new payment type → edit PaymentProcessor switch
Good: Add a new class implementing PaymentProvider interface

## L — Liskov Substitution Principle
Subtypes must be substitutable for their base type.
Bad:  Square extends Rectangle but breaks setWidth() semantics
Good: Both implement a Shape interface with area()

## I — Interface Segregation Principle
Many specific interfaces > one general interface.
Bad:  Worker interface with work() + eat() + sleep()
Good: Workable | Eatable | Sleepable — implement only what's needed

## D — Dependency Inversion Principle
Depend on abstractions, not concretions.
Bad:  OrderService directly instantiates MySQLOrderRepo
Good: OrderService depends on IOrderRepository; inject concrete impl

# Other Guiding Principles
Favour composition over inheritance.
Program to an interface, not an implementation.
YAGNI — You Aren't Gonna Need It.
DRY — Don't Repeat Yourself.
Law of Demeter — talk only to your immediate friends.`,
                },
              ],
            },
          },
          // ── Creational ────────────────────────────────────────────────────────
          {
            title: "Creational — Singleton & Prototype",
            description: "Singleton for single instances; Prototype for cheap object cloning",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Singleton",
                  content: `// Singleton — guarantees exactly one instance of a class.
// Use: config managers, connection pools, loggers, feature flag stores.
// Avoid: if it holds mutable global state that makes testing painful.

class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, string> = {};

  private constructor() {
    // Load config once
    this.config = { apiUrl: "https://api.example.com", timeout: "5000" };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get(key: string): string {
    return this.config[key] ?? "";
  }
}

// Usage
const cfg = ConfigManager.getInstance();
cfg.get("apiUrl"); // "https://api.example.com"
ConfigManager.getInstance() === cfg; // true — same object

// Module-level singleton (simpler in Node/TS — module cache = singleton)
// config.ts
export const config = {
  apiUrl: process.env.API_URL ?? "https://api.example.com",
};
// Any importer gets the same object reference.`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Prototype",
                  content: `// Prototype — clone an existing object instead of constructing from scratch.
// Use: expensive-to-create objects, undo stacks, game entities, config presets.

interface Cloneable<T> {
  clone(): T;
}

class Bullet implements Cloneable<Bullet> {
  constructor(
    public x: number,
    public y: number,
    public speed: number,
    public damage: number,
    public sprite: string, // imagine loading this from disk is expensive
  ) {}

  clone(): Bullet {
    return new Bullet(this.x, this.y, this.speed, this.damage, this.sprite);
  }
}

// Prototype registry — named presets
class BulletFactory {
  private prototypes = new Map<string, Bullet>();

  register(name: string, bullet: Bullet) {
    this.prototypes.set(name, bullet);
  }

  create(name: string, x: number, y: number): Bullet {
    const proto = this.prototypes.get(name);
    if (!proto) throw new Error(\`Unknown bullet type: \${name}\`);
    const b = proto.clone();
    b.x = x;
    b.y = y;
    return b;
  }
}

const factory = new BulletFactory();
factory.register("laser",  new Bullet(0, 0, 800, 50, "laser.png"));
factory.register("rocket", new Bullet(0, 0, 200, 300, "rocket.png"));

const laser = factory.create("laser", 100, 200);  // cloned, not reconstructed`,
                },
              ],
            },
          },
          {
            title: "Creational — Factory & Abstract Factory",
            description: "Decouple object creation from the code that uses the objects",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Factory Method",
                  content: `// Factory Method — define interface for creating an object, but let subclasses
// (or a parameter) decide which class to instantiate.
// Use: when the exact type isn't known at compile time; decouple creation from use.

interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(\`[console] \${message}\`); }
}

class FileLogger implements Logger {
  log(message: string) { /* write to file */ console.log(\`[file] \${message}\`); }
}

class CloudLogger implements Logger {
  log(message: string) { /* send to cloud */ console.log(\`[cloud] \${message}\`); }
}

// Factory function (simple form — no subclassing needed in TS)
type LoggerType = "console" | "file" | "cloud";

function createLogger(type: LoggerType): Logger {
  switch (type) {
    case "console": return new ConsoleLogger();
    case "file":    return new FileLogger();
    case "cloud":   return new CloudLogger();
  }
}

// Consumer never references concrete classes
const logger = createLogger(process.env.LOG_TARGET as LoggerType ?? "console");
logger.log("Application started");

// Class-based form (classic GoF — subclass overrides factory method)
abstract class Application {
  protected abstract createLogger(): Logger;

  run() {
    const logger = this.createLogger(); // subclass decides
    logger.log("Running");
  }
}

class ServerApplication extends Application {
  protected createLogger() { return new CloudLogger(); }
}`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Abstract Factory",
                  content: `// Abstract Factory — produce families of related objects without specifying
// concrete classes. All products from one factory are compatible with each other.
// Use: cross-platform UI, theme systems, DB + cache pairs per environment.

// Product interfaces
interface Button  { render(): string; onClick(): void; }
interface Input   { render(): string; getValue(): string; }

// Concrete products — Light theme
class LightButton implements Button {
  render()  { return "<button class='light'>Click</button>"; }
  onClick() { console.log("light button clicked"); }
}
class LightInput implements Input {
  render()   { return "<input class='light'>"; }
  getValue() { return "light value"; }
}

// Concrete products — Dark theme
class DarkButton implements Button {
  render()  { return "<button class='dark'>Click</button>"; }
  onClick() { console.log("dark button clicked"); }
}
class DarkInput implements Input {
  render()   { return "<input class='dark'>"; }
  getValue() { return "dark value"; }
}

// Abstract factory interface
interface UIFactory {
  createButton(): Button;
  createInput():  Input;
}

// Concrete factories
class LightThemeFactory implements UIFactory {
  createButton() { return new LightButton(); }
  createInput()  { return new LightInput();  }
}

class DarkThemeFactory implements UIFactory {
  createButton() { return new DarkButton(); }
  createInput()  { return new DarkInput();  }
}

// Consumer works only with interfaces — never references concrete classes
function renderForm(factory: UIFactory) {
  const button = factory.createButton();
  const input  = factory.createInput();
  return \`\${input.render()} \${button.render()}\`;
}

const theme = process.env.THEME === "dark" ? new DarkThemeFactory() : new LightThemeFactory();
renderForm(theme);`,
                },
              ],
            },
          },
          {
            title: "Creational — Builder",
            description: "Construct complex objects step by step with a fluent interface",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Builder",
                  content: `// Builder — separate the construction of a complex object from its representation.
// Use: objects with many optional params, SQL query builders, HTTP request builders,
//      test data factories, configuration objects.

class QueryBuilder {
  private table  = "";
  private conditions: string[] = [];
  private fields  = ["*"];
  private limitVal?: number;
  private offsetVal?: number;
  private orderByClause?: string;

  from(table: string): this {
    this.table = table;
    return this;
  }

  select(...fields: string[]): this {
    this.fields = fields;
    return this;
  }

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  limit(n: number): this {
    this.limitVal = n;
    return this;
  }

  offset(n: number): this {
    this.offsetVal = n;
    return this;
  }

  orderBy(clause: string): this {
    this.orderByClause = clause;
    return this;
  }

  build(): string {
    if (!this.table) throw new Error("Table is required");
    let q = \`SELECT \${this.fields.join(", ")} FROM \${this.table}\`;
    if (this.conditions.length) q += \` WHERE \${this.conditions.join(" AND ")}\`;
    if (this.orderByClause)     q += \` ORDER BY \${this.orderByClause}\`;
    if (this.limitVal != null)  q += \` LIMIT \${this.limitVal}\`;
    if (this.offsetVal != null) q += \` OFFSET \${this.offsetVal}\`;
    return q;
  }
}

const query = new QueryBuilder()
  .from("users")
  .select("id", "name", "email")
  .where("active = true")
  .where("age > 18")
  .orderBy("name ASC")
  .limit(20)
  .offset(40)
  .build();

// SELECT id, name, email FROM users WHERE active = true AND age > 18 ORDER BY name ASC LIMIT 20 OFFSET 40

// Director pattern — encapsulate common build sequences
class UserQueryDirector {
  static activeAdults(builder: QueryBuilder) {
    return builder
      .select("id", "name")
      .where("active = true")
      .where("age >= 18")
      .build();
  }
}`,
                },
              ],
            },
          },
          // ── Structural ────────────────────────────────────────────────────────
          {
            title: "Structural — Adapter & Facade",
            description: "Adapter bridges incompatible interfaces; Facade simplifies complex subsystems",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Adapter",
                  content: `// Adapter — converts the interface of a class into another interface clients expect.
// Use: integrating third-party libraries, legacy code, incompatible APIs.

// Target interface your application expects
interface PaymentProvider {
  charge(amountCents: number, currency: string): Promise<string>; // returns txn ID
}

// Adaptee — third-party Stripe SDK (incompatible interface)
class StripeSDK {
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    confirm: boolean;
  }): Promise<{ id: string; status: string }> {
    // Real SDK call...
    return { id: "pi_123", status: "succeeded" };
  }
}

// Adapter — wraps Stripe to match PaymentProvider
class StripeAdapter implements PaymentProvider {
  constructor(private stripe: StripeSDK) {}

  async charge(amountCents: number, currency: string): Promise<string> {
    const intent = await this.stripe.createPaymentIntent({
      amount: amountCents,
      currency,
      confirm: true,
    });
    return intent.id;
  }
}

// Another adaptee — PayPal SDK
class PayPalSDK {
  async executePayment(total: string, curr: string): Promise<{ paymentId: string }> {
    return { paymentId: "PAY-456" };
  }
}

class PayPalAdapter implements PaymentProvider {
  constructor(private paypal: PayPalSDK) {}

  async charge(amountCents: number, currency: string): Promise<string> {
    const dollars = (amountCents / 100).toFixed(2);
    const result = await this.paypal.executePayment(dollars, currency);
    return result.paymentId;
  }
}

// Consumer uses only PaymentProvider — never knows about Stripe/PayPal
async function processOrder(provider: PaymentProvider, amount: number) {
  const txnId = await provider.charge(amount, "usd");
  console.log(\`Charged. Transaction: \${txnId}\`);
}`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Facade",
                  content: `// Facade — provides a simplified interface to a complex subsystem.
// Use: wrap complex libraries, simplify multi-step workflows,
//      provide a clean public API over an internal subsystem.

// Complex subsystem classes
class VideoDecoder {
  decode(file: string) { return \`decoded:\${file}\`; }
}
class AudioDecoder {
  decode(file: string) { return \`audio:\${file}\`; }
}
class VideoEncoder {
  encode(video: string, format: string) { return \`\${video}.\${format}\`; }
}
class AudioMixer {
  mix(video: string, audio: string) { return \`mixed(\${video},\${audio})\`; }
}
class FileSaver {
  save(data: string, path: string) { console.log(\`Saved \${data} → \${path}\`); }
}

// Facade — single entry point for video conversion
class VideoConverterFacade {
  private videoDecoder = new VideoDecoder();
  private audioDecoder = new AudioDecoder();
  private videoEncoder = new VideoEncoder();
  private audioMixer   = new AudioMixer();
  private fileSaver    = new FileSaver();

  convert(inputFile: string, outputPath: string, format: "mp4" | "webm"): void {
    const video   = this.videoDecoder.decode(inputFile);
    const audio   = this.audioDecoder.decode(inputFile);
    const encoded = this.videoEncoder.encode(video, format);
    const mixed   = this.audioMixer.mix(encoded, audio);
    this.fileSaver.save(mixed, outputPath);
  }
}

// Consumer only sees one method — all subsystem complexity is hidden
const converter = new VideoConverterFacade();
converter.convert("movie.avi", "/output/movie.mp4", "mp4");`,
                },
              ],
            },
          },
          {
            title: "Structural — Decorator & Proxy",
            description: "Decorator adds behaviour dynamically; Proxy controls access to an object",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Decorator",
                  content: `// Decorator — attach additional responsibilities to an object dynamically.
// Prefer over subclassing when behaviour combinations would explode class count.
// Use: logging, caching, validation, retry logic, auth checks around services.

interface DataSource {
  write(data: string): void;
  read(): string;
}

// Concrete component
class FileDataSource implements DataSource {
  private data = "";
  write(data: string) { this.data = data; }
  read(): string      { return this.data; }
}

// Base decorator — delegates to wrapped component
class DataSourceDecorator implements DataSource {
  constructor(protected wrapped: DataSource) {}
  write(data: string) { this.wrapped.write(data); }
  read(): string      { return this.wrapped.read(); }
}

// Concrete decorators — add behaviour on top
class EncryptionDecorator extends DataSourceDecorator {
  write(data: string) {
    const encrypted = Buffer.from(data).toString("base64"); // simplified
    super.write(encrypted);
  }
  read(): string {
    return Buffer.from(super.read(), "base64").toString("utf-8");
  }
}

class CompressionDecorator extends DataSourceDecorator {
  write(data: string) {
    super.write(\`compressed(\${data})\`); // simplified
  }
  read(): string {
    return super.read().replace(/^compressed\\(|\\)$/g, "");
  }
}

class LoggingDecorator extends DataSourceDecorator {
  write(data: string) {
    console.log(\`[write] \${data.slice(0, 40)}...\`);
    super.write(data);
  }
  read(): string {
    const result = super.read();
    console.log(\`[read]  \${result.slice(0, 40)}...\`);
    return result;
  }
}

// Stack decorators at runtime — any combination
let source: DataSource = new FileDataSource();
source = new EncryptionDecorator(source);
source = new CompressionDecorator(source);
source = new LoggingDecorator(source);

source.write("sensitive user data");
source.read();`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Proxy",
                  content: `// Proxy — controls access to an object (same interface, different behaviour).
// Types: Virtual (lazy init), Protection (auth), Remote (network), Caching, Logging.
// Use: lazy-load expensive resources, cache results, access control.

interface ImageService {
  getImage(url: string): Promise<string>; // returns image data
}

// Real service — expensive (network call)
class RealImageService implements ImageService {
  async getImage(url: string): Promise<string> {
    console.log(\`[network] fetching \${url}\`);
    return \`<image data from \${url}>\`;
  }
}

// Caching Proxy
class CachingImageProxy implements ImageService {
  private cache = new Map<string, string>();
  constructor(private real: ImageService) {}

  async getImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      console.log(\`[cache hit] \${url}\`);
      return this.cache.get(url)!;
    }
    const data = await this.real.getImage(url);
    this.cache.set(url, data);
    return data;
  }
}

// Protection Proxy
class AuthImageProxy implements ImageService {
  constructor(private real: ImageService, private userRole: string) {}

  async getImage(url: string): Promise<string> {
    if (this.userRole !== "premium" && url.includes("/premium/")) {
      throw new Error("Access denied: premium content");
    }
    return this.real.getImage(url);
  }
}

// Usage — consumer uses ImageService interface throughout
const service: ImageService = new CachingImageProxy(new RealImageService());
await service.getImage("https://cdn.example.com/photo.jpg"); // network
await service.getImage("https://cdn.example.com/photo.jpg"); // cache hit

// Built-in JS Proxy for meta-programming
const handler: ProxyHandler<Record<string, unknown>> = {
  get(target, prop) {
    console.log(\`Getting \${String(prop)}\`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(\`Setting \${String(prop)} = \${value}\`);
    return Reflect.set(target, prop, value);
  },
};
const obj = new Proxy({} as Record<string, unknown>, handler);`,
                },
              ],
            },
          },
          {
            title: "Structural — Composite & Bridge",
            description: "Composite treats trees of objects uniformly; Bridge separates abstraction from implementation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Composite",
                  content: `// Composite — compose objects into tree structures; treat individual objects
// and compositions uniformly via a common interface.
// Use: file systems, UI component trees, org charts, menu hierarchies.

interface FileSystemNode {
  name: string;
  size(): number;
  print(indent?: string): void;
}

// Leaf
class File implements FileSystemNode {
  constructor(public name: string, private bytes: number) {}
  size()               { return this.bytes; }
  print(indent = "")   { console.log(\`\${indent}📄 \${this.name} (\${this.bytes}B)\`); }
}

// Composite — holds children, delegates operations
class Directory implements FileSystemNode {
  private children: FileSystemNode[] = [];
  constructor(public name: string) {}

  add(node: FileSystemNode)    { this.children.push(node); }
  remove(node: FileSystemNode) { this.children = this.children.filter(c => c !== node); }

  size(): number {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }

  print(indent = "") {
    console.log(\`\${indent}📁 \${this.name}/\`);
    this.children.forEach(c => c.print(indent + "  "));
  }
}

// Build tree — client code works with FileSystemNode regardless of type
const root = new Directory("project");
const src  = new Directory("src");
src.add(new File("index.ts",  2048));
src.add(new File("utils.ts",  1024));

const assets = new Directory("assets");
assets.add(new File("logo.png", 45000));

root.add(src);
root.add(assets);
root.add(new File("README.md", 512));

root.print();
console.log(\`Total: \${root.size()}B\`);`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Bridge",
                  content: `// Bridge — decouple an abstraction from its implementation so both can
// vary independently. Prefer over deep inheritance hierarchies.
// Use: cross-platform rendering, multiple DB drivers, theming systems.

// Implementation interface
interface Renderer {
  renderCircle(x: number, y: number, radius: number): string;
  renderRect(x: number, y: number, w: number, h: number): string;
}

// Concrete implementations
class SVGRenderer implements Renderer {
  renderCircle(x: number, y: number, r: number) {
    return \`<circle cx="\${x}" cy="\${y}" r="\${r}"/>\`;
  }
  renderRect(x: number, y: number, w: number, h: number) {
    return \`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}"/>\`;
  }
}

class CanvasRenderer implements Renderer {
  renderCircle(x: number, y: number, r: number) {
    return \`ctx.arc(\${x},\${y},\${r},0,2*Math.PI)\`;
  }
  renderRect(x: number, y: number, w: number, h: number) {
    return \`ctx.fillRect(\${x},\${y},\${w},\${h})\`;
  }
}

// Abstraction — holds reference to implementation (the bridge)
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
}

// Refined abstractions
class Circle extends Shape {
  constructor(renderer: Renderer, private x: number, private y: number, private r: number) {
    super(renderer);
  }
  draw() { return this.renderer.renderCircle(this.x, this.y, this.r); }
}

class Rectangle extends Shape {
  constructor(renderer: Renderer, private x: number, private y: number,
              private w: number, private h: number) {
    super(renderer);
  }
  draw() { return this.renderer.renderRect(this.x, this.y, this.w, this.h); }
}

// Mix any shape with any renderer — 2 dimensions vary independently
const svg    = new SVGRenderer();
const canvas = new CanvasRenderer();

new Circle(svg,    50, 50, 25).draw(); // <circle .../>
new Circle(canvas, 50, 50, 25).draw(); // ctx.arc(...)
new Rectangle(svg, 10, 10, 100, 50).draw();`,
                },
              ],
            },
          },
          // ── Behavioral ────────────────────────────────────────────────────────
          {
            title: "Behavioral — Strategy & Template Method",
            description: "Strategy swaps algorithms at runtime; Template Method fixes the skeleton and defers steps",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Strategy",
                  content: `// Strategy — define a family of algorithms, encapsulate each one, make them
// interchangeable. Let the algorithm vary independently from clients that use it.
// Use: sorting, payment methods, compression, auth strategies, pricing rules.

interface SortStrategy<T> {
  sort(data: T[]): T[];
}

class BubbleSort<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++)
      for (let j = 0; j < arr.length - i - 1; j++)
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    return arr;
  }
}

class QuickSort<T> implements SortStrategy<T> {
  sort(data: T[]): T[] {
    if (data.length <= 1) return data;
    const pivot = data[Math.floor(data.length / 2)];
    return [
      ...this.sort(data.filter(x => x < pivot)),
      ...data.filter(x => x === pivot),
      ...this.sort(data.filter(x => x > pivot)),
    ];
  }
}

// Context — uses a strategy
class DataProcessor<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  process(data: T[]): T[] {
    return this.strategy.sort(data);
  }
}

const processor = new DataProcessor(new QuickSort<number>());
processor.process([3, 1, 4, 1, 5, 9]);

// Swap strategy at runtime
processor.setStrategy(new BubbleSort<number>());
processor.process([3, 1, 4, 1, 5, 9]);

// In TypeScript, strategies are often just functions (simpler)
type Discount = (price: number) => number;
const noDiscount:     Discount = p => p;
const tenPercent:     Discount = p => p * 0.9;
const flatTenDollars: Discount = p => Math.max(0, p - 10);

function checkout(price: number, discount: Discount) {
  return discount(price);
}`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Template Method",
                  content: `// Template Method — define the skeleton of an algorithm in a base class;
// defer some steps to subclasses without changing the overall structure.
// Use: data parsing pipelines, report generation, game turns, ETL processes.

abstract class DataMigration {
  // Template method — defines the algorithm skeleton
  run(): void {
    const data    = this.extract();
    const cleaned = this.transform(data);
    this.load(cleaned);
    this.notify();
  }

  // Steps subclasses must implement
  protected abstract extract(): string[];
  protected abstract transform(data: string[]): string[];

  // Step with a default — subclasses may override
  protected load(data: string[]): void {
    console.log(\`Loading \${data.length} records into default store\`);
  }

  // Hook — optional override, does nothing by default
  protected notify(): void {}
}

class CSVToPostgresMigration extends DataMigration {
  protected extract(): string[] {
    console.log("Reading CSV file...");
    return ["row1", "row2", "row3"];
  }

  protected transform(data: string[]): string[] {
    return data.map(row => row.toUpperCase());
  }

  protected load(data: string[]): void {
    console.log(\`INSERT \${data.length} rows into PostgreSQL\`);
  }

  protected notify(): void {
    console.log("Slack notification: migration complete");
  }
}

class JSONToMongoMigration extends DataMigration {
  protected extract(): string[] {
    console.log("Fetching JSON from S3...");
    return ["{}", "{}"];
  }

  protected transform(data: string[]): string[] {
    return data.map(d => JSON.stringify(JSON.parse(d)));
  }
  // Uses default load() and no notification
}

new CSVToPostgresMigration().run();
new JSONToMongoMigration().run();`,
                },
              ],
            },
          },
          {
            title: "Behavioral — Observer & Mediator",
            description: "Observer for event-driven notifications; Mediator to reduce coupling between many objects",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Observer",
                  content: `// Observer — define a one-to-many dependency so when one object changes state,
// all its dependents are notified automatically.
// Use: event systems, reactive state (Redux, MobX), DOM events, pub/sub.

type Listener<T> = (event: T) => void;

// Generic typed EventEmitter (Observer pattern)
class EventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<Listener<unknown>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as Listener<unknown>);
    return () => this.off(event, listener); // returns unsubscribe fn
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown>);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.listeners.get(event)?.forEach(l => l(data));
  }
}

// Domain example
type OrderEvents = {
  placed:   { orderId: string; total: number };
  paid:     { orderId: string; txnId: string };
  shipped:  { orderId: string; trackingId: string };
};

const orderBus = new EventEmitter<OrderEvents>();

// Subscribers
const unsubEmail = orderBus.on("placed", ({ orderId, total }) =>
  console.log(\`Email: Order \${orderId} placed — $\${total}\`)
);
orderBus.on("placed",  ({ orderId }) => console.log(\`Inventory: reserve for \${orderId}\`));
orderBus.on("paid",    ({ txnId })   => console.log(\`Ledger: record txn \${txnId}\`));
orderBus.on("shipped", ({ trackingId }) => console.log(\`SMS: tracking \${trackingId}\`));

// Publisher
orderBus.emit("placed",  { orderId: "ORD-1", total: 99.99 });
orderBus.emit("paid",    { orderId: "ORD-1", txnId: "pi_123" });
orderBus.emit("shipped", { orderId: "ORD-1", trackingId: "1Z999AA1" });

unsubEmail(); // stop receiving emails`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Mediator",
                  content: `// Mediator — define an object that encapsulates how a set of objects interact.
// Reduces chaotic many-to-many dependencies to a star topology.
// Use: chat rooms, air traffic control, form field interdependencies, UI coordination.

interface Component {
  name: string;
  setMediator(mediator: Mediator): void;
  receive(from: string, message: string): void;
}

interface Mediator {
  notify(sender: Component, event: string, data?: string): void;
}

// Concrete components — know only about the mediator, not each other
class TextInput implements Component {
  name = "TextInput";
  private mediator!: Mediator;
  private value = "";

  setMediator(m: Mediator) { this.mediator = m; }
  receive(from: string, message: string) {
    if (message === "clear") { this.value = ""; console.log("TextInput cleared"); }
  }

  change(value: string) {
    this.value = value;
    this.mediator.notify(this, "change", value);
  }
}

class SubmitButton implements Component {
  name = "SubmitButton";
  private mediator!: Mediator;
  private enabled = false;

  setMediator(m: Mediator) { this.mediator = m; }
  receive(_from: string, message: string) {
    this.enabled = message === "enable";
    console.log(\`SubmitButton: \${this.enabled ? "enabled" : "disabled"}\`);
  }

  click() {
    if (!this.enabled) return console.log("Button disabled");
    this.mediator.notify(this, "submit");
  }
}

class ErrorLabel implements Component {
  name = "ErrorLabel";
  private mediator!: Mediator;
  setMediator(m: Mediator) { this.mediator = m; }
  receive(_from: string, message: string) { console.log(\`Error: \${message}\`); }
}

// Mediator — coordinates component interactions
class FormMediator implements Mediator {
  constructor(
    private input:  TextInput,
    private button: SubmitButton,
    private error:  ErrorLabel,
  ) {
    input.setMediator(this);
    button.setMediator(this);
    error.setMediator(this);
  }

  notify(sender: Component, event: string, data?: string) {
    if (sender.name === "TextInput" && event === "change") {
      if (!data || data.length < 3) {
        this.button.receive("mediator", "disable");
        this.error.receive("mediator",  "Minimum 3 characters");
      } else {
        this.button.receive("mediator", "enable");
        this.error.receive("mediator",  "");
      }
    }
    if (sender.name === "SubmitButton" && event === "submit") {
      console.log("Form submitted!");
      this.input.receive("mediator", "clear");
      this.button.receive("mediator", "disable");
    }
  }
}

const input  = new TextInput();
const button = new SubmitButton();
const error  = new ErrorLabel();
const form   = new FormMediator(input, button, error);

input.change("hi");       // too short → button disabled
input.change("hello");    // valid → button enabled
button.click();           // submits and resets`,
                },
              ],
            },
          },
          {
            title: "Behavioral — Command & Chain of Responsibility",
            description: "Command encapsulates actions as objects; Chain passes requests through a handler pipeline",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Command",
                  content: `// Command — encapsulate a request as an object, allowing parameterisation,
// queuing, logging, and undo/redo.
// Use: undo/redo stacks, task queues, macro recording, transactional operations.

interface Command {
  execute(): void;
  undo(): void;
}

// Receiver — the object that knows how to do the actual work
class TextEditor {
  private content = "";

  getContent()                     { return this.content; }
  insert(pos: number, text: string){ this.content = this.content.slice(0, pos) + text + this.content.slice(pos); }
  delete(pos: number, len: number) { this.content = this.content.slice(0, pos) + this.content.slice(pos + len); }
}

// Concrete commands
class InsertCommand implements Command {
  constructor(
    private editor: TextEditor,
    private pos: number,
    private text: string,
  ) {}

  execute() { this.editor.insert(this.pos, this.text); }
  undo()    { this.editor.delete(this.pos, this.text.length); }
}

class DeleteCommand implements Command {
  private deleted = "";
  constructor(private editor: TextEditor, private pos: number, private len: number) {}

  execute() {
    this.deleted = this.editor.getContent().slice(this.pos, this.pos + this.len);
    this.editor.delete(this.pos, this.len);
  }
  undo() { this.editor.insert(this.pos, this.deleted); }
}

// Invoker — manages command history
class CommandHistory {
  private history: Command[] = [];
  private cursor = -1;

  execute(cmd: Command) {
    this.history = this.history.slice(0, this.cursor + 1); // discard redo stack
    cmd.execute();
    this.history.push(cmd);
    this.cursor++;
  }

  undo() {
    if (this.cursor < 0) return;
    this.history[this.cursor--].undo();
  }

  redo() {
    if (this.cursor >= this.history.length - 1) return;
    this.history[++this.cursor].execute();
  }
}

const editor  = new TextEditor();
const history = new CommandHistory();

history.execute(new InsertCommand(editor, 0, "Hello"));
history.execute(new InsertCommand(editor, 5, " World"));
console.log(editor.getContent()); // "Hello World"

history.undo();
console.log(editor.getContent()); // "Hello"

history.redo();
console.log(editor.getContent()); // "Hello World"`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Chain of Responsibility",
                  content: `// Chain of Responsibility — pass a request along a chain of handlers.
// Each handler decides to process it or pass it to the next.
// Use: middleware pipelines, auth → validation → rate-limit → business logic,
//      log level filtering, exception handler chains.

interface Handler<T> {
  setNext(handler: Handler<T>): Handler<T>;
  handle(request: T): string | null;
}

abstract class AbstractHandler<T> implements Handler<T> {
  private next?: Handler<T>;

  setNext(handler: Handler<T>): Handler<T> {
    this.next = handler;
    return handler; // allows chaining: a.setNext(b).setNext(c)
  }

  handle(request: T): string | null {
    return this.next?.handle(request) ?? null;
  }
}

// HTTP middleware example
type HttpRequest = { path: string; token?: string; body: unknown; method: string };

class AuthHandler extends AbstractHandler<HttpRequest> {
  handle(req: HttpRequest) {
    if (!req.token) return "401 Unauthorized";
    console.log("[Auth] Token valid");
    return super.handle(req);
  }
}

class RateLimitHandler extends AbstractHandler<HttpRequest> {
  private counts = new Map<string, number>();

  handle(req: HttpRequest) {
    const key = req.token!;
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    if (count > 100) return "429 Too Many Requests";
    console.log(\`[RateLimit] \${count}/100\`);
    return super.handle(req);
  }
}

class ValidationHandler extends AbstractHandler<HttpRequest> {
  handle(req: HttpRequest) {
    if (req.method === "POST" && !req.body) return "400 Bad Request: body required";
    console.log("[Validation] Passed");
    return super.handle(req);
  }
}

class BusinessHandler extends AbstractHandler<HttpRequest> {
  handle(req: HttpRequest) {
    console.log(\`[Business] Processing \${req.method} \${req.path}\`);
    return "200 OK";
  }
}

// Wire up the chain
const auth       = new AuthHandler();
const rateLimit  = new RateLimitHandler();
const validation = new ValidationHandler();
const business   = new BusinessHandler();

auth.setNext(rateLimit).setNext(validation).setNext(business);

auth.handle({ path: "/api/orders", token: "abc", body: { item: 1 }, method: "POST" });
auth.handle({ path: "/api/orders", token: undefined, body: null, method: "GET" });`,
                },
              ],
            },
          },
          {
            title: "Behavioral — State & Memento",
            description: "State changes object behaviour per state; Memento captures and restores snapshots",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "State",
                  content: `// State — allow an object to alter its behaviour when its internal state changes.
// The object will appear to change its class.
// Use: traffic lights, vending machines, order lifecycle, connection states,
//      UI flows, game character states.

interface OrderState {
  pay(order: Order): void;
  ship(order: Order): void;
  cancel(order: Order): void;
  label(): string;
}

class Order {
  private state: OrderState = new PendingState();

  setState(state: OrderState) { this.state = state; }
  getState()                  { return this.state.label(); }

  pay()    { this.state.pay(this); }
  ship()   { this.state.ship(this); }
  cancel() { this.state.cancel(this); }
}

class PendingState implements OrderState {
  label() { return "PENDING"; }
  pay(order: Order) {
    console.log("Payment received");
    order.setState(new PaidState());
  }
  ship(order: Order)   { console.log("Error: cannot ship unpaid order"); }
  cancel(order: Order) {
    console.log("Order cancelled");
    order.setState(new CancelledState());
  }
}

class PaidState implements OrderState {
  label() { return "PAID"; }
  pay(order: Order)    { console.log("Already paid"); }
  ship(order: Order) {
    console.log("Order shipped");
    order.setState(new ShippedState());
  }
  cancel(order: Order) {
    console.log("Refund issued");
    order.setState(new CancelledState());
  }
}

class ShippedState implements OrderState {
  label() { return "SHIPPED"; }
  pay(order: Order)    { console.log("Already paid"); }
  ship(order: Order)   { console.log("Already shipped"); }
  cancel(order: Order) { console.log("Cannot cancel shipped order"); }
}

class CancelledState implements OrderState {
  label() { return "CANCELLED"; }
  pay(order: Order)    { console.log("Order cancelled"); }
  ship(order: Order)   { console.log("Order cancelled"); }
  cancel(order: Order) { console.log("Already cancelled"); }
}

const order = new Order();
order.pay();    // PENDING → PAID
order.ship();   // PAID → SHIPPED
order.cancel(); // Cannot cancel shipped order`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Memento",
                  content: `// Memento — capture and externalise an object's internal state so it can be
// restored later, without violating encapsulation.
// Use: undo/redo, save states (games), transaction rollback, snapshot/restore.

// Memento — opaque snapshot (only originator can read internals)
class EditorMemento {
  constructor(
    private readonly content: string,
    private readonly cursorPos: number,
    private readonly timestamp = Date.now(),
  ) {}

  // Only the originator (Editor) calls these
  getContent()   { return this.content; }
  getCursor()    { return this.cursorPos; }
  getTimestamp() { return this.timestamp; }
}

// Originator — creates and restores from mementos
class Editor {
  private content   = "";
  private cursorPos = 0;

  type(text: string) {
    this.content   = this.content.slice(0, this.cursorPos) + text + this.content.slice(this.cursorPos);
    this.cursorPos += text.length;
  }

  moveCursor(pos: number) { this.cursorPos = pos; }

  save(): EditorMemento {
    return new EditorMemento(this.content, this.cursorPos);
  }

  restore(memento: EditorMemento) {
    this.content   = memento.getContent();
    this.cursorPos = memento.getCursor();
  }

  toString() { return \`"\${this.content}" (cursor: \${this.cursorPos})\`; }
}

// Caretaker — stores history without knowing memento internals
class UndoManager {
  private history: EditorMemento[] = [];

  push(memento: EditorMemento) { this.history.push(memento); }

  pop(): EditorMemento | undefined { return this.history.pop(); }

  size() { return this.history.length; }
}

const editor  = new Editor();
const history = new UndoManager();

editor.type("Hello");
history.push(editor.save());      // snapshot 1

editor.type(" World");
history.push(editor.save());      // snapshot 2

editor.type("!!!");
console.log(editor.toString());   // "Hello World!!!" (cursor: 15)

editor.restore(history.pop()!);
console.log(editor.toString());   // "Hello World" (cursor: 11)

editor.restore(history.pop()!);
console.log(editor.toString());   // "Hello" (cursor: 5)`,
                },
              ],
            },
          },
          // ── Modern Patterns ───────────────────────────────────────────────────
          {
            title: "Modern Patterns — Repository & Dependency Injection",
            description: "Repository abstracts data access; DI decouples construction from use",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Repository Pattern",
                  content: `// Repository — abstracts the data layer behind a collection-like interface.
// Business logic never imports SQL/ORM directly.
// Use: any application with a persistence layer. Essential for testability.

// Domain entity — pure, no DB dependencies
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Repository interface — domain-owned
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: { active?: boolean }): Promise<User[]>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// Production implementation — PostgreSQL via Prisma
class PrismaUserRepository implements UserRepository {
  constructor(private db: { user: { findUnique: Function; findMany: Function; upsert: Function; delete: Function } }) {}

  findById(id: string)          { return this.db.user.findUnique({ where: { id } }); }
  findByEmail(email: string)    { return this.db.user.findUnique({ where: { email } }); }
  findAll(filters = {})         { return this.db.user.findMany({ where: filters }); }
  save(user: User)              { return this.db.user.upsert({ where: { id: user.id }, update: user, create: user }); }
  delete(id: string)            { return this.db.user.delete({ where: { id } }); }
}

// Test implementation — in-memory, no DB needed
class InMemoryUserRepository implements UserRepository {
  private store = new Map<string, User>();

  async findById(id: string)       { return this.store.get(id) ?? null; }
  async findByEmail(email: string) { return [...this.store.values()].find(u => u.email === email) ?? null; }
  async findAll()                  { return [...this.store.values()]; }
  async save(user: User)           { this.store.set(user.id, user); return user; }
  async delete(id: string)         { this.store.delete(id); }
}

// Service — depends on interface, not implementation
class UserService {
  constructor(private users: UserRepository) {}

  async register(email: string, name: string): Promise<User> {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("Email already registered");
    const user: User = { id: crypto.randomUUID(), email, name, createdAt: new Date() };
    return this.users.save(user);
  }
}

// Production
// const service = new UserService(new PrismaUserRepository(prismaClient));

// Tests — no DB required
const service = new UserService(new InMemoryUserRepository());`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Dependency Injection",
                  content: `// Dependency Injection — provide dependencies from outside rather than
// constructing them internally. Inverting control enables testability & flexibility.
// Forms: constructor injection (preferred), property injection, method injection.

// Without DI — tightly coupled, impossible to test without hitting real SMTP
class BadEmailService {
  send(to: string, subject: string, body: string) {
    const smtp = new (require("nodemailer"))(); // hard dependency
    smtp.sendMail({ to, subject, html: body });
  }
}

// With DI — depends on interface, receives it from outside
interface EmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

// Constructor injection — dependency declared at construction time (best practice)
class WelcomeEmailUseCase {
  constructor(private emailSender: EmailSender) {}

  async execute(userEmail: string, userName: string) {
    await this.emailSender.send(
      userEmail,
      "Welcome!",
      \`Hi \${userName}, welcome to the platform.\`,
    );
  }
}

// Concrete implementations
class SMTPEmailSender implements EmailSender {
  async send(to: string, subject: string, body: string) {
    console.log(\`[SMTP] → \${to}: \${subject}\`);
  }
}

class SendGridEmailSender implements EmailSender {
  constructor(private apiKey: string) {}
  async send(to: string, subject: string, body: string) {
    console.log(\`[SendGrid] → \${to}: \${subject}\`);
  }
}

// Test stub — no network, no side effects
class FakeEmailSender implements EmailSender {
  sent: Array<{ to: string; subject: string }> = [];
  async send(to: string, subject: string) { this.sent.push({ to, subject }); }
}

// Wiring (composition root — one place in the app that wires everything)
const emailSender  = new SMTPEmailSender();
const welcomeEmail = new WelcomeEmailUseCase(emailSender);
welcomeEmail.execute("alice@example.com", "Alice");

// Test wiring
const fakeEmail  = new FakeEmailSender();
const testUseCase = new WelcomeEmailUseCase(fakeEmail);
await testUseCase.execute("test@test.com", "Test");
console.assert(fakeEmail.sent.length === 1);`,
                },
              ],
            },
          },
          {
            title: "Modern Patterns — Iterator, Flyweight & Null Object",
            description: "Iterator traverses collections; Flyweight shares state; Null Object eliminates null checks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Iterator",
                  content: `// Iterator — provide a way to sequentially access elements of a collection
// without exposing its underlying representation.
// In modern JS/TS: implement the iterable protocol ([Symbol.iterator]).

// Custom iterable — infinite Fibonacci sequence
class FibonacciSequence implements Iterable<number> {
  constructor(private limit: number) {}

  [Symbol.iterator](): Iterator<number> {
    let [a, b] = [0, 1];
    let count  = 0;
    const limit = this.limit;

    return {
      next(): IteratorResult<number> {
        if (count++ >= limit) return { value: undefined as unknown as number, done: true };
        const value = a;
        [a, b] = [b, a + b];
        return { value, done: false };
      },
    };
  }
}

// Works with for..of, spread, destructuring, Array.from
for (const n of new FibonacciSequence(8)) {
  process.stdout.write(n + " "); // 0 1 1 2 3 5 8 13
}

// Async iterator — paginated API results
class PaginatedUsers implements AsyncIterable<{ id: string; name: string }[]> {
  constructor(private fetchPage: (page: number) => Promise<{ id: string; name: string }[]>) {}

  async *[Symbol.asyncIterator]() {
    let page = 1;
    while (true) {
      const results = await this.fetchPage(page++);
      if (!results.length) break;
      yield results;
    }
  }
}

const users = new PaginatedUsers(async (page) =>
  page <= 3 ? [{ id: String(page), name: \`User \${page}\` }] : [],
);

for await (const batch of users) {
  console.log(\`Batch: \${batch.map(u => u.name).join(", ")}\`);
}`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Flyweight & Null Object",
                  content: `// Flyweight — share common state among many fine-grained objects to save memory.
// Use: game particles, text character rendering, map tiles, cached DOM styles.

type ParticleType = { color: string; sprite: string; physics: string };

class ParticleFlyweightFactory {
  private cache = new Map<string, ParticleType>();

  get(color: string, sprite: string, physics: string): ParticleType {
    const key = \`\${color}:\${sprite}:\${physics}\`;
    if (!this.cache.has(key)) {
      this.cache.set(key, { color, sprite, physics }); // shared state
      console.log(\`Created flyweight: \${key}\`);
    }
    return this.cache.get(key)!;
  }

  count() { return this.cache.size; }
}

// Particle has extrinsic state (unique per instance) + shared flyweight
class Particle {
  constructor(
    public x: number,
    public y: number,
    private type: ParticleType, // shared — not duplicated
  ) {}

  render() {
    return \`\${this.type.sprite} at (\${this.x},\${this.y}) [\${this.type.color}]\`;
  }
}

const factory = new ParticleFlyweightFactory();
const particles = Array.from({ length: 1000 }, (_, i) =>
  new Particle(i * 2, i * 3, factory.get("red", "spark.png", "gravity"))
);
console.log(\`1000 particles, \${factory.count()} flyweight objects\`); // 1

// ─────────────────────────────────────────────────────────────────────────────

// Null Object — provide a default no-op object instead of null.
// Eliminates null checks throughout the codebase.
interface Logger {
  info(msg: string): void;
  error(msg: string): void;
}

class ConsoleLogger implements Logger {
  info(msg: string)  { console.log(\`[INFO]  \${msg}\`); }
  error(msg: string) { console.error(\`[ERROR] \${msg}\`); }
}

class NullLogger implements Logger {
  info()  {} // intentional no-ops
  error() {}
}

class OrderProcessor {
  constructor(private logger: Logger = new NullLogger()) {}

  process(orderId: string) {
    this.logger.info(\`Processing order \${orderId}\`);
    // ... work ...
    this.logger.info(\`Order \${orderId} complete\`);
  }
}

// No null checks needed anywhere
new OrderProcessor().process("ORD-1");                        // silent
new OrderProcessor(new ConsoleLogger()).process("ORD-2");     // logged`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Design Patterns cheatsheet: ${designPatterns.name} (${designPatterns.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
