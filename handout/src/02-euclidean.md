# Tessellations of the euclidean plane


## Uniform Tilings

Uniform tilings are a larger 

>[!DEFINITION] Vertex transitiv
>A tiling is said to be vertex transitiv if all of its vertices are indistiguishable from each other 



- [ ] (playful) take some regular polygons, find arrangements to cover the plane without gapsing
- [ ] what is a tesselation
- [ ] what makes it regular

## Tilings of the plane

- [ ] definition face, edge, vertex transitivity

## Regular Tesselations


- [ ] platonic tilings
- [ ] proof that there are only three
- [ ] Schläfli Symbol {p, q} describes a tiling where q p-gons meet at each vertex



## Semi- and Quasi-Regular Tessellations

- [ ] archimedian tilings
	- [ ] most are semi-regular derived by truncation
	- [ ] 3.6.3.6 is the only quasi-regular archimedian tiling
- [ ] in a later chapter we can derive semi-regular tilings by truncating, and quasi-regular tilings by rectifiying regular tilings.

https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons#Archimedean,_uniform_or_semiregular_tilings

## Quasi-Regular Tessellations

- [ ] in a later chapter we can derive quasi regular tilings by rectifying

## Tessellation with Möbius Triangles

- [ ] requires discussion about angle sum




A triangle tiling is a tiling made from Schwarz triangles. 

A *Möbius triangle* is a triangle defined by the three tuple $(p q r) \in \mathbb{Z}^3$, which represent it's internal angles. The angle at each vertex are given by

$$
\begin{matrix}
\alpha = \frac{\pi}{p} & \beta = \frac{\pi}{q} & \gamma = \frac{\pi}{r}
\end{matrix}
$$.

Not all choices for $(p q r)$ yield a valid triangle. Must must ensure that the angles form a valid internal angle sum. For a triangle in the Euclidean Plane the angles must add up to $\pi$, hence (p, q, r) define a Euclidean triangle exactly when

$$
\alpha + \beta + \gamma = \pi \Rightarrow
\frac{1}{p} + \frac{1}{r} + \frac{1}{q} = 1
$$

We can tessellate a surface by continuously reflecting a Möbius triangle along it's edges.

Note that changing the order of $p, q, r$ will result in congruent tessellations. 

In the Euclidean plane there exist exactly choices of $(p, q, r)$
\todo{how do you write that the order results in the same tiling but rotated or mirrored}
Let us choose $p, q, r$ in order such that $\pi > \alpha > \beta > \gamma$.

We choose $\alpha = \frac{\pi}{2}$





**Note** 

## Euler Characteristic

The euler characteristic of a cell division is given by \[Weeks, pp.171]
Where $V$ is the number of vertices, $E$ the number of edges and $F$ the number of faces

$\chi = V - E + F$

For polyhedra $\chi=2$ since they can be embedded on the sphere $\mathbb{S}^2$ \[Coxeter, pp. 10]

The gauss-bonnet formula gives the area of different surfaces

$A_\text{sphere} = 2\pi\chi$ 
