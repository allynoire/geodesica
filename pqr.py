## search algorithms to find solutions for moebius triangles in different geometries.

## returns a value determining the geometry of the given moebius triangle.
## a value equal to 0 for an euclidean triangle,
## a value less than 0 for a hyperbolic triangle,
## a value greater than 0 for a spherical triangle.
def pqr_det(p, q, r):
    # 1/p + 1/q + 1/r = 1
    # qr/pqr + pr/pqr + pq/pqr = 1
    # qr + pr + pq = pqr
    # qr + pr + pq - pqr = 0
    return q*r + p*r + p*q - p*q*r


def pqr_hyp(p, q, r): return pqr_det(p, q, r) < 0
def pqr_euc(p, q, r): return pqr_det(p, q, r) == 0
def pqr_sph(p, q, r): return pqr_det(p, q, r) > 0


## returns a string indicating the geometry of the given triangle.
def pqr_geom(p, q, r):
    det = pqr_det(p, q, r)
    if det  < 0: return "hyperbolic"
    if det == 0: return "euclidean"
    if der  > 0: return "spherical"


## returns the bounded values for p.
def p_range() -> range:
    lower = 2
    upper = 3
    return range(lower, upper+1)


## returns the bounded values of q for a given p.
def q_range(p: int) -> range:
    lower = p
    upper = (2*p) // (p-1)
    return range(lower, upper+1)


## returns an upper and lower bounded r for given p and q.
def r_range(p: int, q: int) -> range:
    if p*q == p+q:
        return range(0)
    lower = q
    upper = (p*q) // (p*q - p - q)
    return range(lower, upper+1)


## returns the value of r given p and q for an euclidean triangle.
def r_solve_euc(p: int, q: int) -> int | None:
    num = p*q
    div = p*q - p - q
    if div == 0 or num % div != 0:
        return None
    else:
        return num // div


## searches all solutions in euclidean space.
def search_euc():
    print("searching EUCLIDEAN moebius triangles...")
    for p in p_range():
        for q in q_range(p):
            r = r_solve_euc(p, q)
            print(f"({p} {q} {r if r else "r"})", end=' ')
            if r == None:
                print("could not solve for r")
            elif not pqr_euc(p, q, r):
                print(f"triangle is {pqr_geom(p, q, r)}")
            else:
                print("is a solution")


## searches all solutions in spherical space.
def search_sph():
    print("searching SPHERICAL moebius triangles...")
    for p in p_range():
        for q in q_range(p):
            for r in r_range(p, q):
                print(f"({p} {q} {r if r else "r"})", end=' ')
                if not pqr_sph(p, q, r):
                    print(f"triangle is {pqr_geom(p, q, r)}")
                else:
                    print("is a solution")


## searches all solutions in hyperbolic space.
def search_hyp():
    pass


search_euc()
