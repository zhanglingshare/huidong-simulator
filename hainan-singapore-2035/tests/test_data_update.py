import importlib.util
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('updater',ROOT/'scripts/update_data.py')
u=importlib.util.module_from_spec(spec);spec.loader.exec_module(u)

class DataTests(unittest.TestCase):
    def setUp(self): self.current=json.loads((ROOT/'data/latest.json').read_text())
    def test_failed_source_preserves_prior_success(self):
        old={'id':'official','content_sha256':'prior','label':'last successful source'}
        self.current['documents']=[old]
        def fail(_): raise OSError('temporary failure')
        out=u.collect(self.current,{'sources':[{'id':'official'}]},fail)
        self.assertEqual(out['documents'],[old]);self.assertEqual(out['indicators'],self.current['indicators'])
        self.assertEqual(len(out['failures']),1)
    def test_collected_document_is_not_a_verified_fact(self):
        out=u.collect(self.current,{'sources':[{'id':'a'}]},lambda _:{'id':'a','content_sha256':'x','tier':'unreviewed'})
        self.assertEqual(out['indicators'],self.current['indicators']);self.assertEqual(out['events'],self.current['events'])
    def test_invalid_review_cannot_replace_dataset(self):
        with self.assertRaises(ValueError):u.apply_reviewed(self.current,{'indicators':[{'id':'gdp','value':999}]})
        self.assertTrue(all(r['id'] != 'gdp' for r in self.current['indicators']))
    def test_same_document_does_not_create_false_change(self):
        self.current['documents']=[{'id':'a','content_sha256':'x','fetched_at':'earlier'}]
        out=u.collect(self.current,{'sources':[{'id':'a'}]},lambda _:{'id':'a','content_sha256':'x','fetched_at':'later'})
        self.assertEqual(out,self.current)
    def test_cross_project_data_rejected(self):
        self.current['project_key']='another-project'
        with self.assertRaises(ValueError):u.validate_dataset(self.current)

if __name__=='__main__':unittest.main()
