import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@cheatsheet.dev" },
    update: {},
    create: {
      email: "admin@cheatsheet.dev",
      name: "Admin",
      hashedPassword: "not-a-real-password",
    },
  });

  await prisma.category.deleteMany({
    where: { name: "Agentic AI Tools", userId: admin.id },
  });

  const result = await prisma.category.create({
    data: {
      name: "Agentic AI Tools",
      icon: "🧠",
      color: "purple",
      description: "Agentic AI reference: tool use API, ReAct loop, LangGraph, OpenAI Agents SDK, AutoGen, CrewAI, memory patterns, and observability.",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          {
            title: "Core Agentic Concepts",
            description: "What makes a system agentic and the vocabulary shared across frameworks.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Agentic vocabulary",
                  content: `WHAT MAKES A SYSTEM "AGENTIC"
  Tool use      Model decides to call external functions / APIs
  Memory        Retains context across turns or sessions
  Planning      Reasons through steps before acting (ReAct, CoT)
  Multi-step    Iterative loops — reason → act → observe → repeat
  Autonomy      Decides *what* to do, not just how to execute a script

AGENT vs CHAIN vs PIPELINE
  Pipeline   Fixed data-flow graph, no decision logic
  Chain      Linear sequence of LLM + tool calls, predetermined
  Agent      Dynamic — model chooses next action at each step

THE ReAct LOOP (Reason + Act)
  1. Thought   Model reasons about what to do next
  2. Action    Model emits a tool call
  3. Observe   Tool result is appended to context
  4. Repeat    Until task is complete or turn limit reached

COMMON PATTERNS
  ReAct              Interleaved thought + action (most frameworks)
  Reflection         Generate → critique → refine → return
  Plan-and-Execute   Make full plan first, then execute each step
  Subagent / Router  Orchestrator delegates to specialised agents
  Parallel tools     Fire multiple tool calls at once, merge results`,
                },
              ],
            },
          },
          {
            title: "Anthropic Tool Use API",
            description: "Defining tools, the agentic loop, parallel calls, and tool_choice in the Messages API.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "python",
                  label: "Tool definition + agentic loop",
                  content: `import anthropic

client = anthropic.Anthropic()

tools = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city":  {"type": "string",  "description": "City name"},
                "units": {"type": "string",  "enum": ["celsius", "fahrenheit"],
                          "default": "celsius"},
            },
            "required": ["city"],
        },
    }
]

messages = [{"role": "user", "content": "What's the weather in Tokyo?"}]

# ── Agentic loop ──────────────────────────────────────────────
while True:
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages,
    )

    # Append assistant turn
    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "end_turn":
        break

    if response.stop_reason == "tool_use":
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)   # your dispatch
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })
        messages.append({"role": "user", "content": tool_results})
    else:
        break   # max_tokens or refusal

final_text = next(b.text for b in response.content if b.type == "text")`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Force tool use + parallel tools",
                  content: `# Force a specific tool
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    tool_choice={"type": "tool", "name": "get_weather"},  # must call this
    messages=messages,
)

# Force ANY tool call (no free-text response)
tool_choice={"type": "any"}

# Default — model decides
tool_choice={"type": "auto"}

# ── Parallel tool calls ───────────────────────────────────────
# Model may return multiple tool_use blocks in one response.
# Execute all of them, then return ALL results in one user turn.

tool_results = []
for block in response.content:
    if block.type == "tool_use":
        result = run_tool(block.name, block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": result,
        })

# All results go back in a single user message
messages.append({"role": "user", "content": tool_results})

# ── Error in tool result ──────────────────────────────────────
tool_results.append({
    "type": "tool_result",
    "tool_use_id": block.id,
    "content": "Error: API rate limit exceeded. Retry in 60s.",
    "is_error": True,   # tells the model the tool failed
})`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "Built-in Anthropic tools",
                  content: `# ── Server-executed tools (Anthropic runs these) ─────────────
# web_search, web_fetch, code_execution, tool_search

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    tools=[
        {"type": "web_search_20250305", "name": "web_search"},
        {"type": "code_execution_20250522", "name": "code_execution"},
    ],
    messages=[{"role": "user", "content": "Search for latest LangGraph release notes"}],
)

# ── Computer use (beta) ───────────────────────────────────────
import anthropic

client = anthropic.Anthropic()
response = client.beta.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    tools=[{
        "type": "computer_20241022",
        "name": "computer",
        "display_width_px": 1280,
        "display_height_px": 800,
        "display_number": 1,
    }],
    messages=[{"role": "user", "content": "Open the browser and go to anthropic.com"}],
    betas=["computer-use-2024-10-22"],
)
# Returns tool_use blocks with action: screenshot|click|type|scroll|key`,
                },
              ],
            },
          },
          {
            title: "LangGraph",
            description: "Graph-based agent orchestration with stateful nodes, conditional edges, and checkpointing.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Install",
                  content: `pip install langgraph langchain-anthropic langchain-openai
# Optional persistence
pip install langgraph-checkpoint-sqlite   # SQLite
pip install langgraph-checkpoint-postgres # Postgres`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "ReAct agent with StateGraph",
                  content: `from typing import Annotated
from typing_extensions import TypedDict
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

# ── 1. Define state ───────────────────────────────────────────
class State(TypedDict):
    messages: Annotated[list, add_messages]

# ── 2. Define tools ───────────────────────────────────────────
@tool
def search(query: str) -> str:
    """Search the web for current information."""
    return f"Results for: {query}"

tools = [search]

# ── 3. Bind tools to model ────────────────────────────────────
model = ChatAnthropic(model="claude-sonnet-4-6").bind_tools(tools)

# ── 4. Define nodes ───────────────────────────────────────────
def call_model(state: State):
    return {"messages": [model.invoke(state["messages"])]}

tool_node = ToolNode(tools)   # auto-executes all tool_use blocks

def should_continue(state: State):
    last = state["messages"][-1]
    return "tools" if last.tool_calls else END

# ── 5. Build graph ────────────────────────────────────────────
graph = StateGraph(State)
graph.add_node("agent", call_model)
graph.add_node("tools", tool_node)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")

app = graph.compile()

# ── 6. Run ────────────────────────────────────────────────────
result = app.invoke({"messages": [("user", "What's the weather in Paris?")]})
print(result["messages"][-1].content)`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "Checkpointing & human-in-the-loop",
                  content: `from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import interrupt

# ── Persistent checkpointing ──────────────────────────────────
with SqliteSaver.from_conn_string(":memory:") as memory:
    app = graph.compile(checkpointer=memory)

    config = {"configurable": {"thread_id": "session-42"}}

    # First run
    app.invoke({"messages": [("user", "Plan my trip")]}, config)

    # Resume same thread (memory is restored automatically)
    app.invoke({"messages": [("user", "Add hotel booking")]}, config)

# ── Human-in-the-loop ─────────────────────────────────────────
def review_node(state: State):
    # Pauses graph, surfaces state for human review
    human_feedback = interrupt({"pending_action": state["messages"][-1]})
    return {"messages": [("human", human_feedback)]}

app = graph.compile(
    checkpointer=memory,
    interrupt_before=["tools"],   # pause before every tool call
)

# Run until interrupt
app.invoke(input, config)

# Inspect and resume
state = app.get_state(config)
app.invoke(None, config)   # resume from checkpoint`,
                },
              ],
            },
          },
          {
            title: "OpenAI Agents SDK",
            description: "High-level agent primitives: Agent, Runner, tools, handoffs, and guardrails.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Install",
                  content: `pip install openai-agents`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Agent + function tool",
                  content: `from agents import Agent, Runner, function_tool
from agents.tools import WebSearchTool, FileSearchTool

# ── Function tool ─────────────────────────────────────────────
@function_tool
def get_stock_price(ticker: str) -> str:
    """Return the current stock price for a ticker symbol."""
    return f"{ticker}: $142.00"   # real impl calls your API

# ── Agent definition ──────────────────────────────────────────
agent = Agent(
    name="Finance Assistant",
    instructions="You help users with stock research.",
    model="gpt-4o",
    tools=[
        get_stock_price,
        WebSearchTool(),         # hosted — Bing/Google search
        FileSearchTool(          # hosted — searches vector store
            vector_store_ids=["vs_abc123"]
        ),
    ],
)

# ── Run synchronously ─────────────────────────────────────────
result = Runner.run_sync(agent, "What's the price of AAPL?")
print(result.final_output)

# ── Run asynchronously ────────────────────────────────────────
import asyncio

async def main():
    result = await Runner.run(agent, "Summarise recent news on NVDA")
    print(result.final_output)

asyncio.run(main())`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "Handoffs + guardrails",
                  content: `from agents import Agent, Runner, handoff, input_guardrail, GuardrailFunctionOutput

# ── Handoffs — multi-agent routing ───────────────────────────
billing_agent = Agent(name="Billing", instructions="Handle billing questions.")
tech_agent    = Agent(name="Tech Support", instructions="Handle technical issues.")

triage_agent = Agent(
    name="Triage",
    instructions="Route the user to the right specialist.",
    handoffs=[billing_agent, tech_agent],   # model picks who to hand off to
)

result = Runner.run_sync(triage_agent, "My invoice looks wrong")
print(result.final_output)

# ── Guardrails ────────────────────────────────────────────────
@input_guardrail
async def no_competitor_mentions(ctx, agent, input) -> GuardrailFunctionOutput:
    if "competitor_name" in input.lower():
        return GuardrailFunctionOutput(
            output_info={"reason": "competitor mention"},
            tripwire_triggered=True,   # blocks the agent run
        )
    return GuardrailFunctionOutput(tripwire_triggered=False)

safe_agent = Agent(
    name="Safe Assistant",
    instructions="Help users with product questions.",
    input_guardrails=[no_competitor_mentions],
)`,
                },
              ],
            },
          },
          {
            title: "AutoGen / AG2",
            description: "Microsoft's multi-agent conversation framework: agents, tool registration, and GroupChat.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Install",
                  content: `pip install ag2           # community fork (AG2AI)
# or
pip install pyautogen    # Microsoft's package`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Two-agent conversation",
                  content: `from autogen import AssistantAgent, UserProxyAgent

llm_config = {
    "model": "gpt-4o",
    "api_key": "sk-...",
}

# AssistantAgent — LLM-powered, writes/refines code
assistant = AssistantAgent(
    name="assistant",
    llm_config=llm_config,
    system_message="You are a Python expert. Write clean, tested code.",
)

# UserProxyAgent — executes code, relays human input
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",       # NEVER | ALWAYS | TERMINATE
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,
    },
    is_termination_msg=lambda m: "TERMINATE" in m.get("content", ""),
)

# Start conversation
user_proxy.initiate_chat(
    assistant,
    message="Write a Python function that computes Fibonacci numbers.",
)`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "Tool registration + GroupChat",
                  content: `from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# ── Register a tool ───────────────────────────────────────────
def web_search(query: str) -> str:
    """Search the web."""
    return f"Results for: {query}"

# Register on both executor and suggester
user_proxy.register_for_execution(name="web_search")(web_search)
assistant.register_for_llm(
    name="web_search",
    description="Search the web for current information."
)(web_search)

# ── GroupChat — multiple agents collaborate ───────────────────
researcher = AssistantAgent("researcher", llm_config=llm_config,
    system_message="You find and summarise information.")
writer     = AssistantAgent("writer",     llm_config=llm_config,
    system_message="You write clear reports from research.")
critic     = AssistantAgent("critic",     llm_config=llm_config,
    system_message="You critique and improve written work.")

group_chat = GroupChat(
    agents=[user_proxy, researcher, writer, critic],
    messages=[],
    max_round=12,
    speaker_selection_method="auto",   # auto | round_robin | manual
)

manager = GroupChatManager(groupchat=group_chat, llm_config=llm_config)
user_proxy.initiate_chat(manager, message="Write a report on LLM agents in 2025.")`,
                },
              ],
            },
          },
          {
            title: "CrewAI",
            description: "Role-based multi-agent framework: Agent, Task, Crew, and Process types.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Install",
                  content: `pip install crewai crewai-tools`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Sequential crew",
                  content: `from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool

search_tool = SerperDevTool()   # web search

# ── Agents ────────────────────────────────────────────────────
researcher = Agent(
    role="Senior Research Analyst",
    goal="Uncover cutting-edge developments in AI",
    backstory="You are an expert at finding and synthesising technical info.",
    tools=[search_tool],
    llm="anthropic/claude-sonnet-4-6",
    verbose=True,
    allow_delegation=False,
    max_iter=5,
)

writer = Agent(
    role="Tech Content Strategist",
    goal="Craft compelling content on tech advancements",
    backstory="You turn complex research into engaging narratives.",
    llm="anthropic/claude-sonnet-4-6",
    verbose=True,
)

# ── Tasks ─────────────────────────────────────────────────────
research_task = Task(
    description="Research the latest agentic AI frameworks released in 2025.",
    expected_output="A bullet-point summary of 5 key frameworks with links.",
    agent=researcher,
)

write_task = Task(
    description="Write a blog post based on the research. Include code examples.",
    expected_output="A 600-word blog post in markdown.",
    agent=writer,
    context=[research_task],   # receives output of research_task
    output_file="post.md",
)

# ── Crew ──────────────────────────────────────────────────────
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,
    verbose=True,
)

result = crew.kickoff(inputs={"topic": "agentic frameworks"})
print(result.raw)`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "Hierarchical process + custom tool",
                  content: `from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

# ── Custom tool ───────────────────────────────────────────────
class StockInput(BaseModel):
    ticker: str = Field(description="Stock ticker symbol")

class StockPriceTool(BaseTool):
    name: str = "Stock Price Checker"
    description: str = "Returns the current stock price for a ticker."
    args_schema: type[BaseModel] = StockInput

    def _run(self, ticker: str) -> str:
        return f"{ticker}: $142.50"   # real impl calls API

# ── Hierarchical process ──────────────────────────────────────
# Manager agent routes tasks to workers automatically
crew = Crew(
    agents=[analyst, writer],          # workers
    tasks=[analyse_task, report_task],
    process=Process.hierarchical,
    manager_llm="anthropic/claude-opus-4-6",  # manager model
    verbose=True,
)

# kickoff with dynamic inputs
result = crew.kickoff(inputs={"company": "Anthropic", "quarter": "Q1 2025"})`,
                },
              ],
            },
          },
          {
            title: "Memory Patterns",
            description: "In-context, vector store, episodic, and procedural memory across frameworks.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Memory taxonomy",
                  content: `TYPE              STORAGE              WHAT IT HOLDS          RETRIEVAL
──────────────────────────────────────────────────────────────────────────
In-context        Messages array       Last N turns           Automatic (recency)
Semantic          Vector DB            Past facts / docs      Similarity search
Episodic          Vector + timestamp   Timestamped events     Semantic + temporal
Procedural        System prompt        Skills, rules          Always loaded
Working           Agent scratchpad     Current task state     In-context

WHEN EACH HELPS
  In-context     Short conversations, always available, eats tokens fast
  Semantic       Large knowledge bases, "remember X from 3 months ago"
  Episodic       Case-based reasoning, learning from past task outcomes
  Procedural     Stable skills and policies that never change per-user

POPULAR VECTOR STORES FOR MEMORY
  Pinecone    Managed, fast metadata filtering
  Weaviate    Open-source, hybrid (vector + BM25) search
  Qdrant      Open-source, strong filtering, Rust-based
  pgvector    Postgres extension, no new infra
  Chroma      Lightweight, great for prototypes`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Semantic memory with LangGraph + Pinecone",
                  content: `from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

pc = Pinecone(api_key="...")
embeddings = OpenAIEmbeddings()
store = PineconeVectorStore(index=pc.Index("agent-memory"), embedding=embeddings)

# Save a memory
store.add_texts(
    texts=["User prefers dark mode and uses macOS"],
    metadatas=[{"user_id": "u123", "timestamp": "2025-06-01"}],
)

# Retrieve relevant memories before each agent turn
def recall(query: str, user_id: str, k: int = 5) -> list[str]:
    docs = store.similarity_search(
        query,
        k=k,
        filter={"user_id": user_id},
    )
    return [d.page_content for d in docs]

# Inject memories into system prompt
memories = recall("What are my display preferences?", user_id="u123")
system = f"User context:\\n" + "\\n".join(f"- {m}" for m in memories)`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "CrewAI built-in memory",
                  content: `# CrewAI ships memory out of the box
from crewai import Crew, Process

crew = Crew(
    agents=[...],
    tasks=[...],
    memory=True,           # enable all memory types
    # Fine-grained control:
    # short_term_memory=True    (in-context, current run)
    # long_term_memory=True     (SQLite, persists across runs)
    # entity_memory=True        (entities extracted from conversation)
    # memory_config={
    #     "provider": "mem0",   # use Mem0 as backend
    #     "config": {"user_id": "user-42"},
    # },
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"},
    },
)`,
                },
              ],
            },
          },
          {
            title: "Observability & Evaluation",
            description: "Tracing, debugging, and evaluating agentic workflows with LangSmith, Weave, and OpenTelemetry.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "python",
                  label: "LangSmith tracing",
                  content: `# Auto-traces all LangChain / LangGraph runs
import os
os.environ["LANGSMITH_API_KEY"]    = "ls__..."
os.environ["LANGSMITH_TRACING"]    = "true"
os.environ["LANGSMITH_PROJECT"]    = "my-agent"

# That's it — every chain/graph run is traced automatically.

# Manual spans (any framework)
from langsmith import traceable

@traceable(name="call-external-api", run_type="tool")
def fetch_data(query: str) -> dict:
    return api.get(query)

# Evaluate runs
from langsmith.evaluation import evaluate

def correctness(run, example):
    return {"score": 1 if run.outputs["answer"] == example.outputs["answer"] else 0}

evaluate(
    lambda inputs: agent.invoke(inputs),
    data="my-dataset",
    evaluators=[correctness],
)`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Weights & Biases Weave",
                  content: `import weave

weave.init("my-agent-project")   # connects to W&B project

# Decorate functions to trace them
@weave.op()
def run_agent(prompt: str) -> str:
    return agent.invoke(prompt)

# All calls to run_agent() are logged:
#   inputs, outputs, latency, token counts, cost
result = run_agent("What is the capital of France?")

# Weave also auto-patches: OpenAI, Anthropic, LangChain, LlamaIndex
# No extra code needed after weave.init()`,
                },
                {
                  order: 2,
                  language: "python",
                  label: "OpenTelemetry (framework-agnostic)",
                  content: `# Works with any observability backend (Honeycomb, Datadog, Jaeger, etc.)
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Setup
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(
    endpoint="https://api.honeycomb.io/v1/traces",
    headers={"x-honeycomb-team": "YOUR_KEY"},
)))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("my-agent")

# Instrument an agent step
with tracer.start_as_current_span("agent-turn") as span:
    span.set_attribute("user.id", "u123")
    span.set_attribute("model", "claude-sonnet-4-6")
    result = agent.invoke(prompt)
    span.set_attribute("output.length", len(result))

# Arize Phoenix (open-source, local UI)
# pip install arize-phoenix opentelemetry-sdk openinference-instrumentation-anthropic
import phoenix as px
px.launch_app()   # starts local UI at http://localhost:6006

from openinference.instrumentation.anthropic import AnthropicInstrumentor
AnthropicInstrumentor().instrument()   # auto-traces all Anthropic calls`,
                },
              ],
            },
          },
          {
            title: "Tool Design Best Practices",
            description: "How to write tools that models use reliably and safely.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Tool design rules",
                  content: `NAMING
  ✓ Use snake_case verbs:  get_weather, search_products, send_email
  ✗ Avoid ambiguity:       process(), handle(), do_thing()
  ✓ One clear action per tool — don't bundle unrelated capabilities

DESCRIPTIONS (the model reads these to decide when to call)
  ✓ Say what the tool does, what it returns, and when to use it
  ✓ Include what it does NOT do (to prevent misuse)
  ✓ Mention required preconditions ("call get_user_id first")
  ✗ Don't repeat the parameter names — put detail in the schema

INPUT SCHEMA
  ✓ Use enum for finite value sets — fewer hallucinations
  ✓ Add "description" to every parameter
  ✓ Mark only truly required fields as required
  ✓ Use format hints: "format": "date", "format": "email"
  ✗ Avoid deeply nested objects — flat schemas work better

RETURN VALUES
  ✓ Return structured data (JSON) so the model can reason over it
  ✓ Include metadata: source, timestamp, confidence
  ✓ On error, return a human-readable message + error code
  ✓ Keep responses concise — avoid dumping 10 KB of raw HTML

SAFETY
  ✓ Validate and sanitise all inputs before using them
  ✓ Apply rate limiting on expensive / side-effectful tools
  ✓ Use confirmation hooks (human-in-the-loop) for destructive actions
  ✓ Log every tool call with inputs and caller identity`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "Tool error handling pattern",
                  content: `import json
from typing import Any

def safe_tool_call(name: str, fn, **kwargs) -> dict[str, Any]:
    """
    Wrapper that catches exceptions and returns a structured
    error the model can reason over instead of crashing the loop.
    """
    try:
        result = fn(**kwargs)
        return {"ok": True, "data": result}
    except ValueError as e:
        return {"ok": False, "error": "invalid_input",    "message": str(e)}
    except PermissionError as e:
        return {"ok": False, "error": "permission_denied","message": str(e)}
    except TimeoutError:
        return {"ok": False, "error": "timeout",          "message": "Tool timed out after 30s"}
    except Exception as e:
        return {"ok": False, "error": "unknown",          "message": f"Unexpected error: {e}"}

# In the agentic loop:
for block in response.content:
    if block.type == "tool_use":
        output = safe_tool_call(block.name, tool_registry[block.name], **block.input)
        tool_results.append({
            "type": "tool_result",
            "tool_use_id": block.id,
            "content": json.dumps(output),
            "is_error": not output["ok"],
        })`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Agentic AI Tools cheatsheet: ${result.name} (${result.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
