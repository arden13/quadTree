class quadTree {
     constructor(box) {
          this.capacity = 4;
          this.boundary = box;
          this.childTrees = [];
          this.childPoints = [];
     }


     show() {
          this.boundary.show();
          if (this.childTrees.length > 0) {
               for (let child of this.childTrees) {
                    child.show();
               }
          }
     }

     insertPoint(pointVect) {
          // if it's not in the box, don't insert & exit returning false
          if (!this.boundary.containsPoint(pointVect)) {
               return false; 
          // elseif there's space, add the point
          } else if (this.childPoints.length < this.capacity && this.childTrees[0] == null) {
               this.childPoints.push(pointVect);
               return true;
          // elseif it's not subdivided, subdivide and insert
          } else if (this.childTrees[0] == null) {
               this.subdivide();
               for (let box of this.childTrees) {
                    if(box.insertPoint(pointVect)) {
                         return true;
                    }
               }
          // else, already subdivided, insert into children
          } else {
               for (let box of this.childTrees) {
                    if (box.insertPoint(pointVect)) {
                         return true;
                    }
               }
          }
     }

     // make four sub-boxes and move points into them
     subdivide() {
          // create new HalfDim and QuarterDim (For moving x/y centers)
          let subboxHalfDim = this.boundary.halfDim/2;

          // create a pointer that will point from old center to new center
          let clockPointer = createVector(subboxHalfDim,subboxHalfDim);

          // create Angle to Rotate
          let angleToRot = HALF_PI;
          for (let i = 0; i < 4; i++) {
               // create new CenterVector & rotate by an angle
               let newCenterVect = p5.Vector.add(this.boundary.center);
               newCenterVect.add(clockPointer.rotate(angleToRot*i));

               // initialize childBox into this.childBoxes array
               this.childTrees.push(new quadTree(new box(newCenterVect,subboxHalfDim)));
          }
          
          // loop over all points in this.childPoints and insert
          // SHOULD automatically insert into childBoxes...
          for (let parentPoint of this.childPoints) {
               this.insertPoint(parentPoint);
          }
     }

     // Query the tree with a given box
     boxQuery(searchBox) {
          // initialize return points
          let foundPoints = [];

          // return empty array if no intersect
          if (!this.boundary.boxIntersect(searchBox)) {
               return foundPoints;

          // else if there are no children, search this box
          } else if (this.childTrees.length == 0) {
               for (let point of this.childPoints) {
                    if (searchBox.containsPoint(point)) {
                         foundPoints.push(point);
                    }
               }
          // else, there ARE children, push the query
          } else {               
               // loop over all childBoxes
               for (let childTree of this.childTrees) {
                    // find child points
                    let childPoints = childTree.boxQuery(searchBox);

                    // concatenate childPoints onto foundPoints
                    foundPoints = foundPoints.concat(childPoints);
               }
          }

          // return all foundPoints
          return foundPoints;
     }

     // Query the tree with a given box
     circleQuery(centerVector,radius) {
          // initialize return points
          let foundPoints = [];

          // return empty array if no intersect
          if (!this.boundary.circleIntersect(centerVector,radius)) {
               return foundPoints;

          // else if there are no children, search this box
          } else if (this.childTrees.length == 0) {
               for (let point of this.childPoints) {
                    // using vector math to calc distance. (easier to conv. to multidimension)
                    let centerToPointVect = p5.Vector.add(centerVector);
                    centerToPointVect.sub(point);
                    let distance = centerToPointVect.mag();

                    if (distance <= radius) {
                         foundPoints.push(point);
                    }
               }
          // else, there ARE children, push the query
          } else {               
               // loop over all childBoxes
               for (let childTree of this.childTrees) {
                    // find child points
                    let childPoints = childTree.circleQuery(centerVector,radius);

                    // concatenate childPoints onto foundPoints
                    foundPoints = foundPoints.concat(childPoints);
               }
          }

          // return all foundPoints
          return foundPoints;
     }
}