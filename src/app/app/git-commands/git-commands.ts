export const gitCommands = {
    add: {
      label: "add",
      options: {
        "new-changes": {
          label: "new changes",
          command: "git add .",
        },
        "add-new-branch": {
          label: "add new branch",
          options: {
            "no-checkout": {
              label: "without checkout",
              command: "git branch <branch-name>",
            },
            checkout: {
              label: "with checkout",
              command: "git checkout -b <branch-name>",
            },
            "checkout-remote": {
              label: "checkout remote branch",
              command: "git checkout -b <branch-name> origin/<branch-name>",
            },
          },
        },
        "add-repo": {
          label: "add new remote repository",
          command: "git remote add <remote-name> <remote-url>",
        },
        "add-alias": {
          label: "add Git alias",
          command: "git config --global alias.<alias-name> '<git-command>'",
        },
        "add-annotated-tag": {
          label: "add annotated tag",
          command: "git tag -a <tag-name> -m '<tag-message>'",
        },
        "add-annotated-tag-for-old-commit": {
          label: "add annotated tag for old commit",
          command: "git tag -a <tag-name> <commit-hash> -m '<tag-message>'",
        },
      },
    },
    commit: {
      label: "commit",
      options: {
        "local-changes": {
          label: "commit local changes",
          command: "git commit -m '<commit-message>'",
        },
        "staged-changes": {
          label: "commit staged changes",
          command: "git commit -m '<commit-message>'",
        },
      },
    },
    revert: {
      label: "revert",
      options: {
        "specific-commit": {
          label: "revert specific commit",
          command: "git revert <commit-hash>",
        },
        "specific-file": {
          label: "revert specific file",
          command: "git checkout <commit-hash> -- <file-path>",
        },
        "to-last-commit": {
          label: "revert to last commit",
          command: "git reset --hard HEAD^",
        },
        "to-last-commit-from-remote": {
          label: "revert to last commit from remote",
          command: "git reset --hard origin/<branch-name>",
        },
      },
    },
    show: {
      label: "show/view",
      options: {
        "repo-status": {
          label: "repository status",
          command: "git status",
        },
        logs: {
          label: "logs",
          options: {
            all: {
              label: "all logs",
              command: "git log",
            },
            "last-n-commit": {
              label: "last n commits",
              command: "git log -n <number>",
            },
            "particular-period": {
              label: "logs for a particular period",
              command: "git log --since='<date>' --until='<date>'",
            },
            "commit-on-oneline": {
              label: "commit logs on one line",
              command: "git log --oneline",
            },
            "patches-introduced": {
              label: "patches introduced in each commit",
              command: "git log -p",
            },
          },
        },
        uncommittedChanges: {
          label: "uncommitted changes",
          command: "git diff",
        },
        committedChanges: {
          label: "committed changes",
          command: "git log -p",
        },
        remoteUrl: {
          label: "remote URL",
          command: "git remote -v",
        },
        stash: {
          label: "stashed changes",
          command: "git stash list",
        },
        branch: {
          label: "branches",
          options: {
            in: {
              label: "local branches",
              command: "git branch",
            },
            outside: {
              label: "remote branches",
              command: "git branch -r",
            },
          },
        },
        tags: {
          label: "tags",
          command: "git tag",
        },
      },
    },
    compareCommits: {
      label: "compare commits",
      options: {
        terminal: {
          label: "compare in terminal",
          command: "git diff <commit-hash1> <commit-hash2>",
        },
        file: {
          label: "compare specific file",
          command: "git diff <commit-hash1> <commit-hash2> -- <file-path>",
        },
      },
    },
    clone: {
      label: "clone",
      options: {
        "clone-repo-into-a-new-dir": {
          label: "clone repo into a new directory",
          command: "git clone <repository-url>",
        },
        "clone-repo-into-a-current-dir": {
          label: "clone repo into current directory",
          command: "git clone <repository-url> .",
        },
        "clone-repo-with-submodule-into-a-current-dir": {
          label: "clone repo with submodules into current directory",
          command: "git clone --recurse-submodules <repository-url>",
        },
        "clone-submodule-after": {
          label: "clone submodules after cloning repo",
          command: "git submodule update --init --recursive",
        },
      },
    },
    merge: {
      label: "merge",
      options: {
        branch: {
          label: "merge branch",
          command: "git merge <branch-name>",
        },
        "single-file": {
          label: "merge single file from another branch",
          command: "git checkout <branch-name> <file-path>",
        },
      },
    },
    squash: {
      label: "squash",
      options: {
        pr: {
          label: "squash pull request",
          command: "git merge --squash <branch-name>",
        },
        commits: {
          label: "squash last n commits",
          command: "git rebase -i HEAD~<n>",
        },
      },
    },
    stash: {
      label: "stash",
      options: {
        "save-stash": {
          label: "save changes to stash",
          command: "git stash save '<stash-message>'",
        },
        "list-stash": {
          label: "list stashes",
          command: "git stash list",
        },
        "apply-stash": {
          label: "apply stash",
          options: {
            latest: {
              label: "apply latest stash",
              command: "git stash apply",
            },
            specific: {
              label: "apply specific stash",
              command: "git stash apply stash@{<stash-number>}",
            },
            pop: {
              label: "apply and remove latest stash",
              command: "git stash pop",
            },
          },
        },
        show: {
          label: "show stash contents",
          command: "git stash show -p",
        },
        "delete-stash": {
          label: "delete stash",
          options: {
            all: {
              label: "delete all stashes",
              command: "git stash clear",
            },
            specific: {
              label: "delete specific stash",
              command: "git stash drop stash@{<stash-number>}",
            },
          },
        },
        "create-branch": {
          label: "create branch from stash",
          command: "git stash branch <branch-name> stash@{<stash-number>}",
        },
      },
    },
    rebase: {
      label: "rebase",
      options: {
        "origin-branch": {
          label: "rebase on origin branch",
          command: "git rebase origin/<branch-name>",
        },
        "local-branch": {
          label: "rebase on local branch",
          command: "git rebase <branch-name>",
        },
        skip: {
          label: "skip current patch",
          command: "git rebase --skip",
        },
        continue: {
          label: "continue rebase after resolving conflicts",
          command: "git rebase --continue",
        },
      },
    },
    cherrypick: {
      label: "cherry-pick",
      options: {
        "origin-branch": {
          label: "cherry-pick from origin branch",
          command: "git cherry-pick <commit-hash>",
        },
      },
    },
    delete: {
      label: "delete",
      options: {
        branch: {
          label: "delete branch",
          command: "git branch -d <branch-name>",
        },
        "delete-multiple-branches": {
          label: "delete multiple branches",
          options: {
            name: {
              label: "by name",
              command: "git branch -D <branch1-name> <branch2-name>",
            },
            pattern: {
              label: "by pattern",
              command: "git branch | grep '<pattern>' | xargs git branch -D",
            },
          },
        },
        tag: {
          label: "delete tag",
          command: "git tag -d <tag-name>",
        },
        remote: {
          label: "delete remote",
          command: "git remote remove <remote-name>",
        },
        "untracked-files": {
          label: "delete untracked files",
          command: "git clean -fd",
        },
        "files-from-index": {
          label: "delete files from index",
          command: "git rm --cached <file-path>",
        },
        "local-branches-not-on-remote": {
          label: "delete local branches not on remote",
          command: "git remote prune origin",
        },
        "files-from-old-commit": {
          label: "delete files from old commit",
          command: "git filter-branch --tree-filter 'rm -f <file-path>' HEAD",
        },
      },
    },
  }
  
  