# Tile Types
WATER, SOIL          = 0, 1       # Basic elements
MOISTURE             = 2          # Mineral
LIGHT, HEAT          = 3, 4       # Light and heat map
TREE, LEAF, ID       = 5, 6, 7    # Tree
SUPPORT              = 8          # Support Map
MINERAL, SUGAR       = 9, 10      # Mineral and Sugar
PULL_W_X, PULL_W_Y   = 11, 12     # Water Pull
PULL_M_X, PULL_M_Y   = 13, 14     # Mineral Pull
PULL_S_X, PULL_S_Y   = 15, 16     # Sugar Pull
SUPPRESSOR           = 17         # Tree branch suppressor
SEED                 = 18         # Seed
N_CHANNELS           = 19         # Number of channels

# Tree Bits (up to 24 bits should retain precision in float32)
HAS_SEED = 1<<0
HAS_ROOT = 1<<1
HAS_SHOOT = 1<<2
HAS_NODE = 1<<3
HAS_OUTER_WOOD = 1<<4
HAS_HEART_WOOF = 1<<5
TREE_TYPE_BITS = 1<<8
TREE_ID_BITS   = 1<<16

# Epsilons
EPSILON = 1e-6