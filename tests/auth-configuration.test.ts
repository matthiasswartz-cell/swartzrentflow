import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { authConfigurationIssue } from '../lib/auth-configuration';
const cases: Array<[string, string | undefined, string | undefined, string | null]> = [
  ['development formats accepted', 'pk_test_ZGVtbyQ=', 'sk_test_example_not_a_real_key', null],
  ['production formats accepted', 'pk_live_ZGVtbyQ=', 'sk_live_example_not_a_real_key', null],
  ['missing public key', undefined, 'sk_test_example', 'PUBLISHABLE_KEY_INVALID'],
  ['public prefix omitted', 'ZGVtbyQ=', 'sk_test_example', 'PUBLISHABLE_KEY_INVALID'],
  ['public contains whitespace', 'pk_test_ZGVtbyQ= ', 'sk_test_example', 'PUBLISHABLE_KEY_INVALID'],
  ['missing server key', 'pk_test_ZGVtbyQ=', undefined, 'SECRET_KEY_MISSING'],
  ['masked server key', 'pk_test_ZGVtbyQ=', '\u2022\u2022\u2022', 'SECRET_KEY_MASKED'],
  ['masked suffix', 'pk_test_ZGVtbyQ=', 'sk_test_\u2022\u2022', 'SECRET_KEY_MASKED'],
  ['server prefix omitted', 'pk_test_ZGVtbyQ=', 'example', 'SECRET_KEY_INVALID'],
  ['server has newline', 'pk_test_ZGVtbyQ=', 'sk_test_example\n', 'SECRET_KEY_INVALID'],
  ['server wrapped in quotes', 'pk_test_ZGVtbyQ=', '"sk_test_example"', 'SECRET_KEY_INVALID'],
  ['mixed environments', 'pk_test_ZGVtbyQ=', 'sk_live_example', 'KEY_ENVIRONMENTS_DIFFER'],
];
for (const [name, p, s, expected] of cases) test(name, () => assert.equal(authConfigurationIssue(p, s), expected));
