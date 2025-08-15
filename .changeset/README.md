# Changesets

This repository uses Changesets for versioning and releasing packages.

To create a changeset:

```
pnpm dlx changeset
```

To version and publish (CI will usually do this on main):

```
pnpm dlx changeset version
pnpm -w build
pnpm dlx changeset publish
```


