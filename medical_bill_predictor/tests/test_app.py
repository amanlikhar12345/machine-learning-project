import re
import unittest

import joblib
import pandas as pd

from app import app


class PredictRouteTestCase(unittest.TestCase):
    def test_predict_uses_model_feature_order(self):
        client = app.test_client()
        response = client.post(
            "/predict",
            data={
                "age": "30",
                "sex": "male",
                "bmi": "27.9",
                "children": "1",
                "smoker": "yes",
                "region": "northeast",
            },
        )

        self.assertEqual(response.status_code, 200)
        html = response.get_data(as_text=True)
        match = re.search(r"Estimated Insurance Cost : \$([0-9,]+\.[0-9]{2})", html)
        self.assertIsNotNone(match)

        model = joblib.load("model.pkl")
        expected = model.predict(
            pd.DataFrame(
                [{
                    "age": 30,
                    "bmi": 27.9,
                    "children": 1,
                    "sex_male": 1,
                    "smoker_yes": 1,
                    "region_northwest": 0,
                    "region_southeast": 0,
                    "region_southwest": 0,
                }]
            )
        )[0]
        actual = float(match.group(1).replace(",", ""))
        self.assertAlmostEqual(actual, expected, places=2)


if __name__ == "__main__":
    unittest.main()
