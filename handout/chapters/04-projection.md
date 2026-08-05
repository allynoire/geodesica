# Stereographic Projection

Now that we have an understanding of how lines and triangles behave on a sphere 

As of now we have studied two-dimensional spherical geometry embedded on the surface of a three-dimensional object, the sphere. This is obviously very natural, yet it begs the question whether we could somehow flatten the surface of the sphere. 

We already use projections for our figures, where the sphere is orthographically or perspectively projected onto the 2d image. Which our brains are very used to seeing, we are able to reconstruct a 3d interpretation in our minds eye.

The questions is whether there are other projections that might prove more useful in comparing spherical geometry to euclidean and hyperbolic geometry. We want our projection to have useful properties. 

- The projection should be bijective in order for us to have one to one corespondace between points in the projection and points in the embedding.
- it should preserve “useful” geometric properties
	- conformal (angle preserving)
	- geodesics should map into ”intuitive” counterpart
- it should come with a metric

---

Let $\Phi: S \subset \mathbb{R}^3 \to \mathbb{R}^2$ be the projection from the sphere to the plane and $\Phi^{-1}: \mathbb{R}^2 \to S \subset \mathbb{R}^3$ the unprojection that from the plane to the spehere. Let $(x,y,z) \in S$ denote points on the sphere and $(X,Y) \in \mathbb{R}^2$ points on the plane


$$\Phi(x,y,z) = \left(\frac{x}{1-z}, \frac{y}{1-z}\right) = (X, Y)$$

$$\Phi^{-1}(X, Y) = \left(\frac{2X}{X^2+Y^2+1}, \frac{2Y}{X^2+Y^2+1}, \frac{X^2 + Y^2 - 1}{X^2+Y^2+1}\right)= (x,y,z)$$

The stereographic projection maps great circles to

- straight lines through the origin, if the great circle  intersects the north pole (projection point)
- or circles otherwise

Proof. Let a great circle be given by its unit normal vector $\hat n = (n_X, n_y, n_z)$. Points on the great circle are given by 

$$xn_x + yn_y + zn_z = 0$$
we substitute $x,y,z$ by unprotecting the corresponding point on the plane $(X,Y)$

$$\begin{split}
\Leftrightarrow 
n_x\frac{2X}{X^2+Y^2+1} + n_y\frac{2Y}{X^2+Y^2+1} + n_z\frac{X^2 + Y^2 - 1}{X^2+Y^2+1}&=0 \\[1em]
\Leftrightarrow
2Xn_x + 2Yn_y + n_z(X^2 + Y^2 - 1) &=0
\end{split}$$

If $n_z = 0$, in which case the great circle must intersect the north and south pole, the equation degenerates into a linear equation, giving us points on a straight line through the origin.

$$\Leftrightarrow 2Xn_x + 2Yn_y = 0$$

If $n \not= 0$ we divide by $n_z$

$$\Leftrightarrow 2X\frac{n_x}{n_z}+2Y\frac{n_y}{n_z} + X^2 + Y^2 - 1 = 0$$

We substitute $a = 2\frac{n_x}{n_z}$ and $b = 2\frac{n_y}{n_z}$ for readablity and rearange to

$$\Leftrightarrow (X^2 + aX) + (Y^2 + bY) = 1$$

finally, by completing the square we end up with the equation of a circle

$$\Leftrightarrow \left(X + \frac{a}{2} \right)^2 + \left(Y + \frac{b}{2}\right)^2 = 1 + \left(\frac{a}{2}\right)^2 + \left(\frac{b}{2}\right)^2$$

We can determine the exact properties the projected great cirlces

In the first case, the line given by the normal vector $\hat n’ = \begin{pmatrix}n_x\\ n_y\end{pmatrix}$

$$\begin{split}
2Xn_x + 2Yn_y &= 0\\
\Leftrightarrow Xn_x + Yn_y &= 0 \\
\Leftrightarrow \begin{pmatrix}X\\ Y\end{pmatrix} \cdot \begin{pmatrix}n_x \\ n_y\end{pmatrix} &= 0
\end{split}$$ 
In the second case, the circle can be described by it’s center $C = (c_x, x_y)$ and radius $r$

The radius is given by 
$$\begin{split}
r &= 1 + \left(\frac{a}{2}\right)^2 + \left(\frac{b}{2}\right)^2 
= 1 + \frac{n_x^2+ n_y^2}{n_z^2}\\[1em]
c_x &= -\frac{a}{2} = -\frac{n_x}{n_z} \\[1em]
c_y &= -\frac{b}{2} = -\frac{n_y}{n_z}
\end{split}$$

- The circle is smallest with radius $r=1$ when $\hat n = (0, 0, \pm 1)$, i.e. when the great circle lies on the equator
- The radius grows to infinity as $r \overset{n_z \rightarrow 0}\longrightarrow \infty$

- [ ] show how the formula changes if we offset the sphere along the z-axis, while still projecting from it’s north pole

- [ ] no isometric mapping
- [ ] to get a better understanding of hyperbolic models in the next chapter, we want to understand the projection S2 onto E2
- [ ] Great circles map to circles or lines
- [ ] Reflection on lines becomes inversion
- [ ] Excursion into mapping of transformations on the sphere
- [ ] Distortions through the projection


## Polar Coordinates

- [ ] r: radius
- [ ] $\theta$: inclination
- [ ] $\phi$: azimuth (polar angle)
- [ ] conversation cartesian coordinates 

## Distance Metric 

- [ ] how we measure distance on the sphere
- [ ] how we measure distance in our model 
- [ ] area metric