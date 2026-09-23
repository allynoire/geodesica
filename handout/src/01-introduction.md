# Introduction

What is non-Euclidean geometry? I believe most people in the modern world have a vague understanding of what non-Euclidean means. It is often connotated with a reality that isn't like ours and it is often used as an umbrella term to describe all sorts of related concepts. In this handout we try to give a mathematical introduction to the concepts of non-Euclidean geometries. As a visual aide throughout this journey we make use of tessellations.

This document serves as a self-study guide that picks up on topics from discrete mathematics and linear algebra. The reader should be familiar and comfortable handling graph theory, complex numbers and linear transformations. It is worth looking up the following concepts as these will serve as our basis.

* Euler Characteristic $\chi = V - E + F$
* Euler Formula $e^{i \phi} = \cos(\phi) + i \sin(\phi)$
* Polar coordinates $(\theta, r)$
* Spherical coordinates $(\theta, \phi, r)$
* Orthogonal Projection
* Stereographic Projection

We highly encourage you to read further into the matter if you are interested. This handout merely scrapes the top of this vast field of mathematics.
\todo{mention notable mathematicians in this field? see (see tasks/260922-112332.md)}

## Historical Background

In order for us to get a grasp on non-Euclidean geometries, we should first understand what makes a geometry Euclidean in the first place. We should all be relatively familiar with Euclidean geometry, it is what most of us understand as **the** theory of geometry and what we are taught out of high school. Euclid of Alexandria, our namesake, formulated the ancient Greek's understanding of geometry, which later formed the classical understanding of geometry. In his work Euclid gives us the definition of geometric elements, which coincide with our modern understanding.
Furthermore Euclid states five Axioms.

1. To draw a straight line \[segment\] from any point to any point.
2. To produce a finite straight line \[segment\] continuously in a straight line.
3. To describe a circle with any center and distance.
4. That all right angles are equal to one another.
5. That, if a straight line falling on two straight lines make the interior angles on the same side less than two right angles, the two straight lines, if produced indefinitely, meet on that side on which are the angles less than two right angles.[pp. Euclid's elements]

The first four axioms are very easily interpretable. Two points can be connected by a straight line segment, line segments can be infinitely extended into lines, there exists a circle with any center and radius and all the right angles must be equal to one another.

The fifth postulate, also coined the parallel postulate, is where things get interesting. At first glance it seems out of place. An simpler but equivalent formulation this is given by Playfair's axiom. It states that on a plane, given a line and a point not on it, only one parallel line to the given line can be drawn through the point. Throughout the ages mathematicians have speculated that the fifth axiom is superfluous and could be derived from the first four. Many tried to find a proof without success.

\missingfigure{illustration parallel postulate}

A geometry becomes non-Euclidean if we modify the fifth axiom [@cite]. There are two non-Euclidean geometries that arise from this change. Elliptic Geometry, where there are exist zero parallels to a given one and hyperbolic Geometry where there exist infinitely many.

\todo{When omiting the fifth axiom completely we talk about absolute geometry Faber 1983, pg. 131, }

\todo{State Hilbert's axioms, or mention it as the modern axiomatization, see handout from uni-bielefeld}

## Topology



## Gaussian-Curvature

When discussing non-Euclidean Geometry one will sooner or later fall upon the term gaussian-curvature. Gaussian curvature is a measure of how much a 2-dimensional surface curves at a specific point in space.

\todo{try to give analog from 1d curvature}

We call a curvature constant if it is the same at each point.

Gaussian-Curvature is an intrinsic property of a surface. Meaning that a being living entirely on the surface could determine it's measure. 

The sphere gives us a surface with constant positive curvature. We call this surfaces embedded in $\mathbb{R}^3$

There exist surfaces with negative curvature in $\mathbb{R}^3$, such as the hyperboloid and paraboloid.

\todo{show parabolid and hyperbolid}

However Hilbert proofed that there are no embeddings of a surface with constant negative curvature in 3-d space. This is the main reason why it is so hard for us to imagine hyperbolic space.

## Tessellations

A *tessellation* (or Tiling) is the process of covering a surface with geometrical shapes so that there are no gaps or overlaps. The shapes used in a tiling are called *tiles*. Tilings are classified by restricting the choice and alignment of tiles.

### Polygonal Tessellations

A *polygonal* tessellation is a tessellation where we restrict the tiles to be polygons. If we further restrict the alignment of tiles, such that adjacent tiles share a common edge and meet at their vertices, we talk about an *edge-to-edge* tiling.

Polygonal edge-to-edge tilings can be classified further using the following properties.

A tiling is said to be *regular*, if all it's tiles are regular polygons.

A tiling is said to be *face*-transitive, if all it's tiles are congruent.

A tiling is said to be *edge*-transitive, if 

### Triangle Tiling



