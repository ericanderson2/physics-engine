# physics-engine

This is a 2D collision engine written entirely in JavaScript for the HTML canvas. No libraries are used.

Separating Axis Theorem is used to implement the collision math.

Test out the site here: https://ericanderson2.github.io/physics-engine/. Works best on latest version of Firefox, Chrome. Set page zoom to around 70% to be able to see all the controls as well as the canvas simultaneously.

## Features
The engine supports any convex polygon. There are customizable settings for things like friction, elasticity, angular friction, mass, and gravity to model collisions in a variety of ways.

Click a shape to select it and see information about its variables. Use WASD to apply impulse to the selected shape and R to apply rotational impulse.

Customizable Settings:
* Friction - the rate at which the velocity of each shape is decreased
* Elasticity - how much momentum is conserved. 1 = fully elastic collisions. 2 = colliding shapes slide
* Angular Friction - the rate at which the angular velocity of each shape is decreased
* Gravity - The acceleration due to gravity in the x and y directions
* Do Collision Rotation - whether or not shapes will rotate after colliding
* Do Collision Resolution - whether or not shapes will collide

Create a shape with any number of sides using the "Add Shape" button. To create an irregular convex polygon, use the console and execute the command:

shapes.push(new Polygon(x, y, points, mass, immovable));

Where x and y are coordinates of the shape's center, mass is a number and immovable is a boolean, and points is an array of Vector representing the vertices' offset from the center of the shape. 

## Original Goals
* User can create polygons of any size/shape
* All complex polygons with any number of sides supported
* Polygons collide, are affected by gravity/other forces
* Polygons realistically rotate

All of the original goals have been reached. The following are things that could be done to improve the engine.

## Improvements
* Implement circles
* Implement bodies consisting of multiple shapes
* Replace the rotation math with matrix rotation
* Find a better way to calculate moment of inertia
* Implement more realistic rotation
* Fix issue with fast moving shapes phasing through each other
* Allow for custom polygon creation through the interface
* Make physics frame-independent to allow for use on lower-end machines

## MIT License
Copyright © 2021 Eric Anderson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
