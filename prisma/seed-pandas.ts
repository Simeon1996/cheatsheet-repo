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
    where: { name: "Pandas", userId: admin.id },
  });

  const pandas = await prisma.category.create({
    data: {
      name: "Pandas",
      icon: "🐼",
      color: "blue",
      description: "Pandas data manipulation: DataFrames, Series, indexing, cleaning, groupby, merging, reshaping, time series, and I/O",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Creating & Inspecting DataFrames ─────────────────────────────
          {
            title: "Creating & Inspecting DataFrames",
            description: "Create DataFrames from dicts, lists, CSV, and inspect shape/dtypes/stats",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Create DataFrames",
                  content: `import pandas as pd
import numpy as np

# From dict
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "age":  [25, 30, 35],
    "score": [88.5, 92.0, 78.3],
})

# From list of dicts
df = pd.DataFrame([
    {"name": "Alice", "age": 25},
    {"name": "Bob",   "age": 30},
])

# From NumPy array
df = pd.DataFrame(np.random.randn(5, 3), columns=["A", "B", "C"])

# Series
s = pd.Series([10, 20, 30], index=["a", "b", "c"], name="values")

# Range of dates
dates = pd.date_range("2024-01-01", periods=6, freq="D")`,
                },
                {
                  order: 1, language: "python", label: "Inspect",
                  content: `df.shape             # (rows, cols)
df.dtypes            # column data types
df.info()            # dtypes + non-null counts + memory
df.describe()        # count/mean/std/min/quartiles/max
df.describe(include="all")  # include object columns too

df.head(5)           # first 5 rows
df.tail(5)           # last 5 rows
df.sample(5)         # random 5 rows

df.columns.tolist()  # column names as list
df.index             # row index
df.values            # underlying NumPy array
df.memory_usage(deep=True)`,
                },
              ],
            },
          },
          // ── Selecting & Indexing ──────────────────────────────────────────
          {
            title: "Selecting & Indexing",
            description: "loc, iloc, boolean masks, query, and MultiIndex",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Column & row selection",
                  content: `# Single column → Series
df["name"]
df.name            # attribute access (avoid if col name clashes)

# Multiple columns → DataFrame
df[["name", "age"]]

# Rows by label — loc (inclusive on both ends)
df.loc[2]                    # row with label 2
df.loc[0:3]                  # rows 0,1,2,3
df.loc[0:3, "name":"score"]  # rows and cols by label
df.loc[:, ["name", "age"]]   # all rows, specific cols

# Rows by position — iloc (exclusive end)
df.iloc[0]           # first row
df.iloc[0:3]         # rows 0,1,2
df.iloc[0:3, 0:2]    # rows 0-2, cols 0-1
df.iloc[-1]          # last row`,
                },
                {
                  order: 1, language: "python", label: "Boolean filtering & query",
                  content: `# Boolean mask
df[df["age"] > 28]
df[df["name"] == "Alice"]
df[(df["age"] > 25) & (df["score"] >= 85)]   # AND
df[(df["age"] < 25) | (df["score"] > 90)]    # OR
df[~(df["age"] > 30)]                        # NOT

# isin
df[df["name"].isin(["Alice", "Charlie"])]

# query — readable string syntax
df.query("age > 28")
df.query("age > 28 and score >= 85")
df.query("name in ['Alice', 'Bob']")

threshold = 85
df.query("score > @threshold")   # use local variable with @`,
                },
                {
                  order: 2, language: "python", label: "Index operations",
                  content: `# Set a column as index
df = df.set_index("name")
df.reset_index()             # move index back to column

# Rename index / columns
df.index.name = "person"
df.columns = ["col1", "col2"]
df.rename(columns={"age": "years", "score": "pts"}, inplace=True)

# MultiIndex
arrays = [["bar", "bar", "baz"], ["one", "two", "one"]]
idx = pd.MultiIndex.from_arrays(arrays, names=["first", "second"])
df.loc["bar"]                  # select first level
df.loc[("bar", "one")]         # select both levels
df.xs("one", level="second")  # cross-section`,
                },
              ],
            },
          },
          // ── Data Cleaning ─────────────────────────────────────────────────
          {
            title: "Data Cleaning",
            description: "Handle missing values, duplicates, type casting, and string cleaning",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Missing values",
                  content: `df.isnull().sum()             # count NaN per column
df.isnull().sum() / len(df)  # fraction missing

# Drop
df.dropna()                  # drop rows with any NaN
df.dropna(how="all")         # drop rows where ALL values are NaN
df.dropna(subset=["age"])    # drop rows where 'age' is NaN
df.dropna(axis=1)            # drop columns with any NaN

# Fill
df.fillna(0)
df.fillna({"age": 0, "score": df["score"].mean()})
df["score"].fillna(df["score"].median(), inplace=True)
df.ffill()                   # forward fill
df.bfill()                   # backward fill

# Interpolate
df["score"].interpolate(method="linear")`,
                },
                {
                  order: 1, language: "python", label: "Duplicates & type casting",
                  content: `# Duplicates
df.duplicated().sum()
df.duplicated(subset=["name"]).sum()
df.drop_duplicates()
df.drop_duplicates(subset=["name"], keep="first")

# Type casting
df["age"] = df["age"].astype(int)
df["score"] = df["score"].astype(float)
df["date"] = pd.to_datetime(df["date"])
df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d")
df["category"] = df["category"].astype("category")

# Check types
df.dtypes
df["age"].dtype`,
                },
                {
                  order: 2, language: "python", label: "String cleaning (str accessor)",
                  content: `s = df["name"]

s.str.lower()
s.str.upper()
s.str.strip()                     # trim whitespace
s.str.replace(r"\\s+", "_", regex=True)
s.str.contains("ali", case=False) # boolean mask
s.str.startswith("A")
s.str.split(",", expand=True)     # split into multiple columns
s.str.extract(r"(\\d+)")          # capture group → column
s.str.len()                       # length of each string
s.str.get(0)                      # first character`,
                },
              ],
            },
          },
          // ── Transforming Data ─────────────────────────────────────────────
          {
            title: "Transforming Data",
            description: "apply, map, assign, cut, clip, sort, and column operations",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "apply, map & assign",
                  content: `# apply — row or column-wise function
df["score_norm"] = df["score"].apply(lambda x: x / 100)
df.apply(lambda col: col.max() - col.min())         # column-wise
df.apply(lambda row: row["score"] * 2, axis=1)      # row-wise

# map — element-wise on Series (rename/encode)
df["grade"] = df["score"].map(lambda x: "A" if x >= 90 else "B")
df["name"] = df["name"].map({"Alice": "A", "Bob": "B"})

# assign — add new columns (chainable)
df = (df
    .assign(score_pct=df["score"] / 100)
    .assign(pass_fail=lambda d: d["score"].ge(60).map({True: "Pass", False: "Fail"}))
)

# applymap / map (DataFrame element-wise, pandas 2.1+)
df.map(lambda x: round(x, 2) if isinstance(x, float) else x)`,
                },
                {
                  order: 1, language: "python", label: "Binning, clipping & sorting",
                  content: `# Bin continuous values
df["grade"] = pd.cut(df["score"], bins=[0, 60, 80, 100], labels=["C", "B", "A"])
df["quartile"] = pd.qcut(df["score"], q=4, labels=["Q1","Q2","Q3","Q4"])

# Clip outliers
df["score"] = df["score"].clip(lower=0, upper=100)

# Sort
df.sort_values("score")
df.sort_values("score", ascending=False)
df.sort_values(["age", "score"], ascending=[True, False])
df.sort_index()

# Rank
df["rank"] = df["score"].rank(method="dense", ascending=False)

# Replace values
df["score"].replace({-1: np.nan, 999: np.nan})`,
                },
              ],
            },
          },
          // ── GroupBy & Aggregation ─────────────────────────────────────────
          {
            title: "GroupBy & Aggregation",
            description: "groupby, agg, transform, filter, pivot_table, and crosstab",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "groupby basics",
                  content: `g = df.groupby("category")

g["score"].mean()
g["score"].agg(["mean", "std", "count"])
g.size()                          # group sizes
g.ngroups                         # number of groups

# Multiple columns
df.groupby(["category", "region"])["revenue"].sum()

# Named aggregations (pandas 0.25+)
df.groupby("category").agg(
    avg_score=("score", "mean"),
    total=("score", "sum"),
    n=("score", "count"),
)

# Apply custom function
df.groupby("category")["score"].agg(lambda s: s.quantile(0.9))`,
                },
                {
                  order: 1, language: "python", label: "transform & filter",
                  content: `# transform — returns same-shape result (great for new columns)
df["group_mean"] = df.groupby("category")["score"].transform("mean")
df["z_score"] = df.groupby("category")["score"].transform(
    lambda s: (s - s.mean()) / s.std()
)

# filter — keep only groups matching a condition
df.groupby("category").filter(lambda g: g["score"].mean() > 80)`,
                },
                {
                  order: 2, language: "python", label: "pivot_table & crosstab",
                  content: `# pivot_table
pd.pivot_table(
    df,
    values="score",
    index="category",
    columns="region",
    aggfunc="mean",
    fill_value=0,
    margins=True,       # row/col totals
)

# crosstab — frequency table
pd.crosstab(df["category"], df["region"])
pd.crosstab(df["category"], df["region"], normalize="index")  # row %

# pivot (no aggregation — requires unique index/col pairs)
df.pivot(index="date", columns="metric", values="value")`,
                },
              ],
            },
          },
          // ── Merging & Joining ─────────────────────────────────────────────
          {
            title: "Merging & Joining",
            description: "merge, join, concat, and combine DataFrames",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "merge (SQL-style joins)",
                  content: `# Inner join (default)
pd.merge(df_left, df_right, on="id")

# Join types
pd.merge(df_left, df_right, on="id", how="left")
pd.merge(df_left, df_right, on="id", how="right")
pd.merge(df_left, df_right, on="id", how="outer")
pd.merge(df_left, df_right, on="id", how="cross")

# Different column names
pd.merge(df_left, df_right, left_on="user_id", right_on="id")

# On index
pd.merge(df_left, df_right, left_index=True, right_index=True)

# Indicator column — shows which table each row came from
pd.merge(df_left, df_right, on="id", how="outer", indicator=True)`,
                },
                {
                  order: 1, language: "python", label: "concat & join",
                  content: `# Stack DataFrames vertically
pd.concat([df1, df2])
pd.concat([df1, df2], ignore_index=True)   # reset index
pd.concat([df1, df2], keys=["2023", "2024"])  # hierarchical index

# Stack DataFrames horizontally
pd.concat([df1, df2], axis=1)

# join — merge on index (shortcut)
df_left.join(df_right)
df_left.join(df_right, how="outer")
df_left.join(df_right, on="key")    # join on column in left

# combine_first — fill NaN from another DataFrame
df1.combine_first(df2)`,
                },
              ],
            },
          },
          // ── Reshaping ─────────────────────────────────────────────────────
          {
            title: "Reshaping",
            description: "melt, stack, unstack, wide_to_long, and explode",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "melt & wide_to_long",
                  content: `# melt — wide → long (unpivot)
pd.melt(df, id_vars=["name"], value_vars=["q1", "q2", "q3"],
        var_name="quarter", value_name="revenue")

# wide_to_long — multiple variable groups
pd.wide_to_long(df, stubnames=["score", "rank"],
                i="id", j="year")`,
                },
                {
                  order: 1, language: "python", label: "stack, unstack & explode",
                  content: `# stack — move columns to rows
stacked = df.stack()          # columns → innermost row index level
df.unstack()                  # innermost row level → columns
df.unstack(level=0)           # specific level

# explode — list values into separate rows
df["tags"] = df["tags"].str.split(",")
df.explode("tags")

# Get dummies — one-hot encode
pd.get_dummies(df["category"])
pd.get_dummies(df, columns=["category", "region"])
pd.get_dummies(df["category"], drop_first=True)  # avoid dummy trap`,
                },
              ],
            },
          },
          // ── Time Series ───────────────────────────────────────────────────
          {
            title: "Time Series",
            description: "date parsing, resampling, rolling windows, and time zone handling",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Dates & dt accessor",
                  content: `# Parse dates
df["date"] = pd.to_datetime(df["date"])
df["date"] = pd.to_datetime(df["date"], format="%d/%m/%Y")

# DatetimeIndex
df = df.set_index("date")
df["2024"]                    # all of 2024
df["2024-03"]                 # March 2024
df["2024-01-01":"2024-03-31"] # date range slice

# dt accessor
df["date"].dt.year
df["date"].dt.month
df["date"].dt.day
df["date"].dt.dayofweek       # 0=Monday
df["date"].dt.is_month_end
df["date"].dt.strftime("%b %Y")`,
                },
                {
                  order: 1, language: "python", label: "Resample & rolling",
                  content: `# Resample — aggregate by time period
df["revenue"].resample("ME").sum()    # month-end
df["revenue"].resample("QE").mean()   # quarter-end
df["revenue"].resample("W").agg({"revenue": "sum", "visits": "mean"})

# Upsampling + fill
df.resample("D").ffill()

# Rolling window
df["revenue"].rolling(window=7).mean()         # 7-day moving average
df["revenue"].rolling(window=30).std()
df["revenue"].rolling("7D").sum()              # time-based window

# Expanding window (cumulative)
df["revenue"].expanding().mean()
df["revenue"].cumsum()
df["revenue"].cumprod()`,
                },
                {
                  order: 2, language: "python", label: "Time zones & offsets",
                  content: `# Localize and convert
df.index = df.index.tz_localize("UTC")
df.index = df.index.tz_convert("America/New_York")

# Date offsets
from pandas.tseries.offsets import BDay, MonthEnd
pd.Timestamp("2024-01-01") + BDay(5)    # 5 business days
pd.Timestamp("2024-01-15") + MonthEnd() # next month end

# Period
p = pd.Period("2024-Q1", freq="Q")
p.start_time
p.end_time

# Business days range
pd.bdate_range("2024-01-01", "2024-01-31")`,
                },
              ],
            },
          },
          // ── I/O ───────────────────────────────────────────────────────────
          {
            title: "I/O — Reading & Writing",
            description: "CSV, Excel, JSON, Parquet, SQL, and clipboard",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "CSV & Excel",
                  content: `# CSV
df = pd.read_csv("data.csv")
df = pd.read_csv("data.csv",
    sep=";",
    header=0,
    index_col="id",
    usecols=["name", "age", "score"],
    dtype={"age": int},
    parse_dates=["date"],
    na_values=["N/A", "NULL", "-"],
    nrows=1000,              # read only first 1000 rows
    skiprows=[1, 2],
)
df.to_csv("out.csv", index=False)

# Excel
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
df.to_excel("out.xlsx", sheet_name="Results", index=False)

# Multiple sheets
with pd.ExcelWriter("out.xlsx") as w:
    df1.to_excel(w, sheet_name="Summary")
    df2.to_excel(w, sheet_name="Detail")`,
                },
                {
                  order: 1, language: "python", label: "JSON, Parquet & SQL",
                  content: `# JSON
df = pd.read_json("data.json")
df = pd.read_json("data.json", orient="records")
df.to_json("out.json", orient="records", indent=2)

# Parquet (requires pyarrow or fastparquet)
df = pd.read_parquet("data.parquet")
df = pd.read_parquet("data.parquet", columns=["name", "score"])
df.to_parquet("out.parquet", compression="snappy", index=False)

# SQL
import sqlalchemy as sa
engine = sa.create_engine("postgresql://user:pass@host/db")

df = pd.read_sql("SELECT * FROM users WHERE active = true", engine)
df = pd.read_sql_table("users", engine)
df.to_sql("users_backup", engine, if_exists="replace", index=False)

# Chunked reading (large files)
for chunk in pd.read_csv("big.csv", chunksize=10_000):
    process(chunk)`,
                },
              ],
            },
          },
          // ── Performance & Useful Patterns ─────────────────────────────────
          {
            title: "Performance & Useful Patterns",
            description: "Efficient operations, method chaining, vectorisation, and memory tips",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "python", label: "Method chaining",
                  content: `result = (
    pd.read_csv("sales.csv", parse_dates=["date"])
    .rename(columns=str.lower)
    .dropna(subset=["revenue"])
    .query("revenue > 0")
    .assign(
        month=lambda d: d["date"].dt.to_period("M"),
        revenue_k=lambda d: d["revenue"] / 1000,
    )
    .groupby("month")
    .agg(total=("revenue_k", "sum"), n=("revenue_k", "count"))
    .reset_index()
    .sort_values("month")
)`,
                },
                {
                  order: 1, language: "python", label: "Vectorisation over loops",
                  content: `# Bad — Python loop
for i, row in df.iterrows():
    df.at[i, "tax"] = row["revenue"] * 0.2   # very slow

# Good — vectorised
df["tax"] = df["revenue"] * 0.2

# Good — np.where for conditionals
df["label"] = np.where(df["score"] >= 60, "Pass", "Fail")

# Good — np.select for multiple conditions
conditions = [df["score"] >= 90, df["score"] >= 70, df["score"] >= 50]
choices    = ["A", "B", "C"]
df["grade"] = np.select(conditions, choices, default="D")

# itertuples is faster than iterrows if you must loop
for row in df.itertuples():
    print(row.name, row.score)`,
                },
                {
                  order: 2, language: "python", label: "Memory & type optimisation",
                  content: `# Downcast numeric types
df["age"]   = pd.to_numeric(df["age"],   downcast="integer")
df["score"] = pd.to_numeric(df["score"], downcast="float")

# Use categorical for low-cardinality strings
df["status"] = df["status"].astype("category")

# Check memory
df.memory_usage(deep=True).sum() / 1024**2   # MB

# Copy vs view
df2 = df.copy()              # explicit copy, avoids SettingWithCopyWarning
df2 = df[["name"]].copy()

# Useful diagnostics
pd.set_option("display.max_columns", 50)
pd.set_option("display.float_format", "{:.2f}".format)
pd.reset_option("all")`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Pandas cheatsheet: ${pandas.name} (${pandas.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
