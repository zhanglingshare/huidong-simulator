import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
class BaselineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads((ROOT/'data/latest.json').read_text(encoding='utf-8'))

    def test_official_data_not_used_to_claim_calibration(self):
        self.assertEqual(self.data['project_key'], 'two-islands-2035-20261030')
        self.assertEqual(self.data['mode'], 'reviewed_official_reference_only')
        for row in self.data['indicators']:
            self.assertEqual(row['model_impact'].split(':')[0], 'none')

    def test_both_islands_present(self):
        self.assertEqual({r['region'] for r in self.data['indicators']}, {'海南','新加坡'})

    def test_currency_and_port_units_remain_distinct(self):
        by_id = {r['id']:r for r in self.data['indicators']}
        self.assertNotEqual(by_id['hn-gdp-2025']['unit'],by_id['sg-gdp-2025']['unit'])
        self.assertNotEqual(by_id['hn-port-cargo-2025']['unit'],by_id['sg-port-teu-2025']['unit'])

    def test_source_fields_and_audit_pass(self):
        import sys
        sys.path.insert(0, str(ROOT/'scripts'))
        from update_data import validate_dataset
        self.assertIsNotNone(validate_dataset(self.data))
        self.assertTrue(all(x['source_url'].startswith('https://') for x in self.data['indicators']))
