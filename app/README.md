# Geodesica

## Build

Geodesica is bundled with vite and served as a static website.

```sh
npm run build
npm run serve
```

## Shader 

### Attributes

| Name         | Type   | Description     |
| :----------- | :----- | :-------------- |
| `a_position` | `vec3` | Vertex position |
| `a_normal`   | `vec3` | Vertex normal   |

### Global Uniforms

| Name              | Type    | Description                            |
| :---------------- | :------ | :------------------------------------- |
| `u_viewMatrix`    | `mat4`  | the view matrix                        |
| `u_invViewMatrix` | `mat4`  | the inverse view matrix                |
| `u_time`          | `float` | the current animation time in seconds  |
| `u_resolution`    | `vec2`  | the current resolution of the viewport |

### Varyings

| Name      | Type   | Description                                 |
| :-------- | :----- | :------------------------------------------ |
| `v_coord` | `vec2` | the coordinate of a fragment in world space |
