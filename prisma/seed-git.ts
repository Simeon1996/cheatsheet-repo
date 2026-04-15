import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Git", userId: null },
  });

  const git = await prisma.category.create({
    data: {
      name: "Git",
      icon: "🌿",
      color: "orange",
      description: "Git version control: setup, branching, merging, rebasing, remotes, stash, tags, history rewriting, and common workflows",
      isPublic: true,
      snippets: {
        create: [
          // ── Setup & Config ────────────────────────────────────────────────
          {
            title: "Setup & Config",
            description: "Initial configuration, aliases, and credential management",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Identity & editor",
                  content: `git config --global user.name "Alice Smith"
git config --global user.email "alice@example.com"
git config --global core.editor "vim"
git config --global init.defaultBranch main

# Show all config
git config --list
git config --global --list

# Show a single value
git config user.email`,
                },
                {
                  order: 1, language: "bash", label: "Useful aliases",
                  content: `git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
git config --global alias.aliases "config --get-regexp alias"

# Use an alias
git lg
git last`,
                },
                {
                  order: 2, language: "bash", label: "Credential & SSH helpers",
                  content: `# Cache credentials in memory (15 min default)
git config --global credential.helper cache
git config --global credential.helper "cache --timeout=3600"

# macOS keychain
git config --global credential.helper osxkeychain

# Generate SSH key
ssh-keygen -t ed25519 -C "alice@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Test GitHub SSH connection
ssh -T git@github.com

# Switch remote from HTTPS to SSH
git remote set-url origin git@github.com:user/repo.git`,
                },
              ],
            },
          },
          // ── Basics ────────────────────────────────────────────────────────
          {
            title: "Basics — Stage, Commit & Undo",
            description: "init, clone, add, commit, reset, restore, and status",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Init & clone",
                  content: `# New repo
git init
git init my-project          # create dir and init

# Clone
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git my-dir   # custom directory
git clone --depth 1 https://github.com/user/repo.git  # shallow clone
git clone --branch develop https://github.com/user/repo.git`,
                },
                {
                  order: 1, language: "bash", label: "Stage & commit",
                  content: `git status                   # working tree status
git status -s                # short format

git add file.txt             # stage file
git add .                    # stage all changes
git add -p                   # interactively stage hunks

git commit -m "feat: add login"
git commit -am "fix: typo"   # stage tracked files + commit
git commit --amend           # edit last commit (message or files)
git commit --amend --no-edit # amend without changing message

# Empty commit (useful for triggering CI)
git commit --allow-empty -m "chore: trigger CI"`,
                },
                {
                  order: 2, language: "bash", label: "Undo changes",
                  content: `# Discard working directory changes
git restore file.txt         # discard unstaged changes
git restore .                # discard all unstaged changes
git checkout -- file.txt     # older equivalent

# Unstage
git restore --staged file.txt
git reset HEAD file.txt      # older equivalent

# Undo commits (keep changes in working tree)
git reset --soft HEAD~1      # undo last commit, keep staged
git reset --mixed HEAD~1     # undo last commit, keep unstaged (default)
git reset --hard HEAD~1      # undo last commit, DISCARD changes

# Revert a commit (safe — creates new commit)
git revert <commit>
git revert HEAD              # revert last commit`,
                },
              ],
            },
          },
          // ── Branching ─────────────────────────────────────────────────────
          {
            title: "Branching",
            description: "Create, switch, rename, delete, and list branches",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create & switch",
                  content: `# List branches
git branch                   # local branches
git branch -r                # remote branches
git branch -a                # all branches

# Create
git branch feature/login
git checkout -b feature/login        # create + switch (classic)
git switch -c feature/login          # create + switch (modern)

# Switch
git checkout main
git switch main

# Create from a specific commit or tag
git checkout -b hotfix/bug v2.1.0
git switch -c hotfix/bug v2.1.0`,
                },
                {
                  order: 1, language: "bash", label: "Rename & delete",
                  content: `# Rename
git branch -m old-name new-name
git branch -m new-name              # rename current branch

# Delete local
git branch -d feature/login         # safe delete (merged only)
git branch -D feature/login         # force delete

# Delete remote
git push origin --delete feature/login
git push origin :feature/login      # older syntax

# Prune stale remote-tracking refs
git fetch --prune
git remote prune origin`,
                },
              ],
            },
          },
          // ── Merging & Rebasing ────────────────────────────────────────────
          {
            title: "Merging & Rebasing",
            description: "merge strategies, rebase, cherry-pick, and conflict resolution",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Merge",
                  content: `# Merge branch into current
git merge feature/login

# Merge strategies
git merge --no-ff feature/login     # always create merge commit
git merge --squash feature/login    # squash all commits, then commit manually
git merge --ff-only feature/login   # fail if not fast-forward

# Abort an in-progress merge
git merge --abort

# After resolving conflicts
git add resolved-file.txt
git merge --continue`,
                },
                {
                  order: 1, language: "bash", label: "Rebase",
                  content: `# Rebase current branch onto main
git rebase main

# Interactive rebase — rewrite last N commits
git rebase -i HEAD~3
# Commands in editor: pick / reword / edit / squash / fixup / drop

# Rebase and auto-squash fixup commits
git commit --fixup <commit>
git rebase -i --autosquash HEAD~5

# Abort / continue rebase
git rebase --abort
git rebase --continue      # after resolving conflicts
git rebase --skip          # skip the conflicting commit

# Rebase onto a different base
git rebase --onto main feature-base feature-branch`,
                },
                {
                  order: 2, language: "bash", label: "Cherry-pick & conflict resolution",
                  content: `# Cherry-pick a commit onto current branch
git cherry-pick <commit>
git cherry-pick a1b2c3d..e4f5g6h    # range (exclusive start)
git cherry-pick a1b2c3d^..e4f5g6h   # range (inclusive start)
git cherry-pick --no-commit <commit> # apply changes without committing

# Conflict resolution tools
git status                  # see conflicting files
git diff                    # see conflict markers
git mergetool               # open configured merge tool

# After resolving manually
git add <resolved-file>
git commit

# Prefer one side entirely
git checkout --ours   file.txt   # keep our version
git checkout --theirs file.txt   # keep their version`,
                },
              ],
            },
          },
          // ── Remotes ───────────────────────────────────────────────────────
          {
            title: "Remotes",
            description: "Adding remotes, fetch, pull, push, and tracking branches",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Manage remotes",
                  content: `git remote -v                          # list remotes
git remote add origin https://github.com/user/repo.git
git remote add upstream https://github.com/original/repo.git
git remote rename origin old-origin
git remote remove upstream
git remote set-url origin git@github.com:user/repo.git`,
                },
                {
                  order: 1, language: "bash", label: "Fetch, pull & push",
                  content: `# Fetch — download without merging
git fetch origin
git fetch --all               # all remotes
git fetch --prune             # also remove stale remote refs

# Pull — fetch + merge (or rebase)
git pull
git pull origin main
git pull --rebase             # rebase instead of merge
git pull --rebase=interactive

# Push
git push origin main
git push -u origin feature/login    # set upstream tracking
git push --force-with-lease         # safe force push
git push --tags                     # push all tags
git push origin --delete branch     # delete remote branch`,
                },
                {
                  order: 2, language: "bash", label: "Tracking branches",
                  content: `# Set upstream tracking
git branch --set-upstream-to=origin/main main
git branch -u origin/main

# Show tracking info
git branch -vv

# Push new local branch and track
git push -u origin feature/login

# Sync fork with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main`,
                },
              ],
            },
          },
          // ── Stash ─────────────────────────────────────────────────────────
          {
            title: "Stash",
            description: "Save, list, apply, and drop stashed changes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Save & list",
                  content: `git stash                            # stash tracked changes
git stash push -m "WIP: login form"  # with description
git stash -u                         # include untracked files
git stash -a                         # include ignored files too

git stash list                       # show all stashes
git stash show                       # summary of latest stash
git stash show -p                    # full diff of latest stash
git stash show stash@{2}             # specific stash`,
                },
                {
                  order: 1, language: "bash", label: "Apply & clean up",
                  content: `git stash pop                  # apply latest + remove from list
git stash apply                # apply latest, keep in list
git stash apply stash@{2}      # apply specific stash

git stash drop                 # remove latest stash
git stash drop stash@{2}       # remove specific stash
git stash clear                # remove ALL stashes

# Create a branch from a stash
git stash branch feature/wip stash@{1}`,
                },
              ],
            },
          },
          // ── Log & Diff ────────────────────────────────────────────────────
          {
            title: "Log & Diff",
            description: "Inspect history, search commits, compare branches, and blame",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Log",
                  content: `git log
git log --oneline
git log --oneline --graph --decorate --all   # visual branch graph
git log -n 10                                # last 10 commits
git log --since="2 weeks ago"
git log --author="Alice"
git log --grep="fix"                         # search commit messages
git log -S "functionName"                    # search code changes (pickaxe)
git log -p                                   # show patches (diffs)
git log --stat                               # files changed per commit
git log main..feature                        # commits in feature not in main
git log --follow -- path/to/file             # history across renames`,
                },
                {
                  order: 1, language: "bash", label: "Diff",
                  content: `git diff                         # unstaged changes
git diff --staged                # staged changes
git diff HEAD                    # all uncommitted changes
git diff main..feature           # between branches
git diff HEAD~3..HEAD            # last 3 commits
git diff <commit1> <commit2>     # between two commits
git diff --stat                  # summary only
git diff -- path/to/file         # specific file only

# Word-level diff
git diff --word-diff`,
                },
                {
                  order: 2, language: "bash", label: "Blame & find",
                  content: `# Show who last changed each line
git blame file.txt
git blame -L 10,20 file.txt     # specific line range
git blame -w file.txt           # ignore whitespace changes
git blame -C file.txt           # detect moved/copied code

# Find the commit that introduced a bug (binary search)
git bisect start
git bisect bad                  # current commit is broken
git bisect good v1.2.0          # this tag was working
# test, then:
git bisect good                 # or: git bisect bad
# repeat until git identifies the culprit
git bisect reset                # exit bisect mode`,
                },
              ],
            },
          },
          // ── Tags ─────────────────────────────────────────────────────────
          {
            title: "Tags",
            description: "Lightweight and annotated tags, listing, pushing, and deleting",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create & list tags",
                  content: `# Lightweight tag
git tag v1.0.0

# Annotated tag (recommended for releases)
git tag -a v1.0.0 -m "Release 1.0.0"

# Tag a specific commit
git tag -a v1.0.0 9fceb02 -m "Release 1.0.0"

# List tags
git tag
git tag -l "v1.*"            # filter by pattern
git show v1.0.0              # show tag details`,
                },
                {
                  order: 1, language: "bash", label: "Push & delete tags",
                  content: `# Push a single tag
git push origin v1.0.0

# Push all tags
git push origin --tags

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0   # older syntax

# Checkout at a tag (detached HEAD)
git checkout v1.0.0

# Create branch from tag
git checkout -b release/v1 v1.0.0`,
                },
              ],
            },
          },
          // ── History Rewriting ─────────────────────────────────────────────
          {
            title: "History Rewriting",
            description: "amend, interactive rebase, filter-branch, and reflog recovery",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Interactive rebase",
                  content: `# Rewrite last N commits
git rebase -i HEAD~4

# Editor commands:
# pick   p — use commit as-is
# reword r — use commit, edit message
# edit   e — use commit, pause to amend
# squash s — meld into previous commit
# fixup  f — like squash, discard message
# drop   d — remove commit entirely

# Auto-fixup workflow
git commit --fixup <target-commit>
git rebase -i --autosquash HEAD~5`,
                },
                {
                  order: 1, language: "bash", label: "Reflog — recover lost commits",
                  content: `# Show reflog (all HEAD movements)
git reflog
git reflog show feature/login

# Recover a dropped commit / branch
git checkout -b recovered abc1234    # create branch from lost commit
git reset --hard HEAD@{3}            # reset to earlier state

# Undo a bad rebase
git reflog
git reset --hard HEAD@{5}            # go back before the rebase`,
                },
                {
                  order: 2, language: "bash", label: "Remove sensitive data",
                  content: `# git filter-repo (preferred — install separately)
pip install git-filter-repo
git filter-repo --path secrets.txt --invert-paths
git filter-repo --replace-text replacements.txt

# BFG Repo Cleaner (Java alternative)
bfg --delete-files secrets.txt
bfg --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# After rewriting — force push all branches
git push origin --force --all
git push origin --force --tags`,
                },
              ],
            },
          },
          // ── Workflows & Tips ──────────────────────────────────────────────
          {
            title: "Workflows & Tips",
            description: "Worktrees, submodules, sparse checkout, and common workflow patterns",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Worktrees",
                  content: `# Check out a branch in a separate directory (no re-cloning)
git worktree add ../hotfix-dir hotfix/critical-bug
git worktree add ../release-dir -b release/v2.0

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../hotfix-dir
git worktree prune              # clean up stale worktree metadata`,
                },
                {
                  order: 1, language: "bash", label: "Submodules",
                  content: `# Add a submodule
git submodule add https://github.com/user/lib.git libs/lib

# Clone repo with submodules
git clone --recurse-submodules https://github.com/user/repo.git

# Initialize after cloning without --recurse-submodules
git submodule update --init --recursive

# Update all submodules to latest
git submodule update --remote --merge

# Remove a submodule
git submodule deinit libs/lib
git rm libs/lib
rm -rf .git/modules/libs/lib`,
                },
                {
                  order: 2, language: "bash", label: "Handy one-liners",
                  content: `# See what would be pushed
git log origin/main..HEAD --oneline

# Find branch containing a commit
git branch --contains <commit>

# Count commits per author
git shortlog -sn

# Show files changed in last commit
git show --stat HEAD
git diff-tree --no-commit-id -r --name-only HEAD

# Grep across all commits
git grep "TODO" $(git rev-list --all)

# Undo last push (rewrite remote — use with caution)
git reset --hard HEAD~1
git push --force-with-lease

# Clean untracked files
git clean -n               # dry run
git clean -fd              # remove untracked files and dirs
git clean -fdx             # also remove ignored files`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Git cheatsheet: ${git.name} (${git.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
