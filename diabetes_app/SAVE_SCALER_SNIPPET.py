# Add this to your notebook right after `scaler.fit_transform(xtrain)` is called,
# then re-download scaler.pkl and drop it into the `model/` folder of this app.

import pickle

with open("scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)
