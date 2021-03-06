import { printNode, createNode, builder as b } from '../src/mod';

test('Print AlterTableStmt', () => {
  const node = createNode('AlterTableStmt', {
    table: b.Identifier('users'),
    action: {
      variant: 'RenameTo',
      newTableName: b.Identifier('users_new'),
    },
  });

  expect(printNode(node)).toBe('ALTER TABLE users RENAME TO users_new');
});

test('Print Select', () => {
  const node = createNode('SelectCore', {
    variant: 'Select',
    from: {
      variant: 'TablesOrSubqueries',
      tablesOrSubqueries: [
        createNode('TableOrSubquery', {
          variant: 'Table',
          table: b.Identifier('users'),
        }),
      ],
    },
    resultColumns: [
      createNode('ResultColumn', {
        variant: 'Star',
      }),
    ],
  });

  expect(printNode(node)).toBe('SELECT * FROM users');
});

test('Print Select using builder', () => {
  const node = b.SelectStmt({
    from: b.From.Join(
      b.TableOrSubquery.Table('users'),
      b.JoinOperator.Join('Left'),
      b.TableOrSubquery.Table('posts'),
      b.JoinConstraint.On(b.Expr.Equal(b.parseColumn('users.id'), b.parseColumn('posts.user_id')))
    ),
    resultColumns: [b.ResultColumn.parseColumn('users.id'), b.ResultColumn.TableStar('users')],
    where: b.Expr.Equal(b.parseColumn('users.name'), b.Expr.literal('azerty')),
  });

  expect(printNode(node)).toBe("SELECT users.id, users.* FROM users LEFT JOIN posts ON users.id == posts.user_id WHERE users.name == 'azerty'");
});

test('Print join of table and subquery', () => {
  const node = b.SelectStmt({
    from: b.From.Join(
      b.TableOrSubquery.Table('posts'),
      b.JoinOperator.Join('Inner'),
      // Find user
      b.TableOrSubquery.Select(
        b.SelectStmt({
          from: b.From.Table('users'),
          resultColumns: [b.ResultColumn.Star()],
          where: b.Expr.Equal(b.parseColumn('users.name'), b.Expr.literal('azerty')),
        }),
        'users'
      ),
      b.JoinConstraint.On(b.Expr.Equal(b.parseColumn('users.id'), b.parseColumn('posts.user_id')))
    ),
    resultColumns: [b.ResultColumn.Star()],
  });

  expect(printNode(node)).toBe("SELECT * FROM posts INNER JOIN (SELECT * FROM users WHERE users.name == 'azerty') AS users ON users.id == posts.user_id");
});

test('CreateTableStmt', () => {
  const node = b.CreateTableStmt(
    'users',
    [
      b.ColumnDef('id', b.TypeName('TEXT'), [b.ColumnConstraint.PrimaryKey()]),
      b.ColumnDef('name', b.TypeName('TEXT')),
      b.ColumnDef('email', b.TypeName('TEXT'), [b.ColumnConstraint.Unique(), b.ColumnConstraint.NotNull()]),
    ],
    { strict: true, ifNotExists: true }
  );

  expect(printNode(node)).toBe('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE NOT NULL) STRICT');
});

test('DeleteStmt', () => {
  const node = b.DeleteStmt('users', {
    where: b.Expr.Equal(b.parseColumn('users.name'), b.Expr.literal('azerty')),
  });

  expect(printNode(node)).toBe("DELETE FROM users WHERE users.name == 'azerty'");
});

test('UpdateStmt', () => {
  const node = b.UpdateStmt('users', {
    setItems: [b.SetItems.ColumnName('foo', b.Expr.literal(42))],
  });

  expect(printNode(node)).toBe('UPDATE users SET foo = 42');
});
