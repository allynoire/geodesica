

def check_euc(p, q, r):
    EPSILON = 1e-6
    return abs(1/p + 1/q + 1/r - 1) <= EPSILON

def check_sph(p, q, r):
    if check_euc(p, q, r):
        return False
    return 1/p + 1/q + 1/r > 1

def brute_force():
    N = 10 # some big number
    for p in range(1, N):
        for q in range(1, N):
            for r in range(1, N):
                if check_sph(p, q, r):
                    print(f"({p} {q} {r})")


def less_brute_force():
    # we want p to be the smallest number i.e. the biggest angle
    # p > 1 since otherwise q, r = 0
    # p <= 3 since otherwise q or r will be greater than p
    # p in { 2, 3 }
    p_min = 2
    p_max = 3
    for p in range(p_min, p_max+1):
        # upper bound depends on p
        # q <= 2p/(p-1)
        # q in { 3, 4 }
        q_min = p_max
        q_max = (2*p) // (p-1)
        for q in range(q_min, q_max+1):
            r_min = q_max
            r_max = (p*q) // (p*q - p - q)
            for r in range(r_min, r_max+1):
                print(f"({p} {q} {r}) {"ok" if check_sph(p, q, r) else ""}")



less_brute_force()