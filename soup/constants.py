# Tile Types
WATER, SOIL          = 0, 1       # Basic elements
MOISTURE             = 2          # Mineral
LIGHT, HEAT          = 3, 4       # Light and heat map
_, LEAF, ID       = 5, 6, 7    # Tree
SUPPORT              = 8          # Support Map
MINERAL, SUGAR       = 9, 10      # Mineral and Sugar
PULL_W_X, PULL_W_Y   = 11, 12     # Water Pull
PULL_M_X, PULL_M_Y   = 13, 14     # Mineral Pull
PULL_S_X, PULL_S_Y   = 15, 16     # Sugar Pull
SUPPRESSOR           = 17         # Tree branch suppressor
SEED                 = 18         # Seed
ROOT                 = 19         # Root
SHOOT                = 20         # Shoot
NOISE                = 21         # Perlin noise
N_CHANNELS           = 22         # Number of channels

# Epsilons
EPSILON = 1e-6