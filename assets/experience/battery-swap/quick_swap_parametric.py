"""
Quick-swap battery mount for 225mm FPV quad - parametric CAD
Per SF-Battery problem statement: tool-less top-insert slide-in,
self-aligning dovetails, rear snap-lock, auto-mating connector.
Units: mm
"""
import cadquery as cq

# ---------------- Parameters ----------------
BAT_L, BAT_W, BAT_H = 78.0, 42.0, 34.0      # 6S LiPo casing outer dims
WALL = 5.0                                   # cradle wall thickness
BASE_T = 4.0                                 # cradle base thickness
CLR = 0.4                                    # slide clearance
RAIL_W, RAIL_D = 8.0, 3.0                    # dovetail rib width/depth
CON_L, CON_W, CON_H = 16.0, 11.0, 8.0        # connector block
PIN = 3.0                                    # connector pin square
LATCH_W = 14.0                               # snap latch width

# ---------------- Battery cassette ----------------
bat = cq.Workplane("XY").box(BAT_L, BAT_W, BAT_H, centered=(True, True, False))
# lead-in chamfer on bottom edges (self-aligning)
bat = bat.edges("|Y and <Z").chamfer(2.0)
# dovetail ribs on both long sides (vertical slide)
for sgn in (1, -1):
    for xoff in (-BAT_L/4, BAT_L/4):
        rib = (cq.Workplane("XY")
               .box(RAIL_W, RAIL_D*2, BAT_H, centered=(True, True, False))
               .translate((xoff, sgn*(BAT_W/2), 0)))
        bat = bat.union(rib)
# connector recess underneath, rear
bat = bat.cut(
    cq.Workplane("XY")
    .box(CON_L+2*CLR, CON_W+2*CLR, CON_H+CLR, centered=(True, True, False))
    .translate((-BAT_L/2+CON_L/2+6, 0, 0)))
# rear lip for snap-lock (notch on top rear edge)
bat = bat.cut(
    cq.Workplane("XY")
    .box(4.0, LATCH_W+2*CLR, 5.0, centered=(True, True, False))
    .translate((-BAT_L/2+2.0-0.001, 0, BAT_H-5.0)))
# pull tab on top front
tab = (cq.Workplane("XY")
       .box(10.0, 18.0, 3.0, centered=(True, True, False))
       .translate((BAT_L/2-3.0, 0, BAT_H)))
bat = bat.union(tab).edges("|Z and >X").chamfer(1.0)

# ---------------- Receiver cradle ----------------
IN_L, IN_W = BAT_L + 2*CLR, BAT_W + 2*CLR
cr_L, cr_W = IN_L + 2*WALL, IN_W + 2*(WALL + RAIL_D)
CR_H = BASE_T + 24.0
cradle = cq.Workplane("XY").box(cr_L, cr_W, CR_H, centered=(True, True, False))
# pocket
cradle = cradle.cut(
    cq.Workplane("XY")
    .box(IN_L, IN_W, CR_H, centered=(True, True, False))
    .translate((0, 0, BASE_T)))
# dovetail grooves in side walls
for sgn in (1, -1):
    for xoff in (-BAT_L/4, BAT_L/4):
        groove = (cq.Workplane("XY")
                  .box(RAIL_W+2*CLR, RAIL_D*2+2*CLR, CR_H, centered=(True, True, False))
                  .translate((xoff, sgn*(IN_W/2), BASE_T)))
        cradle = cradle.cut(groove)
# top lead-in chamfer on pocket edges
cradle = cradle.faces(">Z").edges().chamfer(1.2)
# lightening cutouts in base (thermal + mass)
for xoff in (-18, 8):
    cradle = cradle.cut(
        cq.Workplane("XY")
        .box(16, 24, BASE_T, centered=(True, True, False))
        .translate((xoff+9, 0, 0)))
# mounting ears with holes (frame integration)
for sx in (1, -1):
    ear = (cq.Workplane("XY")
           .box(14, 10, BASE_T, centered=(True, True, False))
           .translate((sx*(cr_L/2+7-0.001), 0, 0)))
    cradle = cradle.union(ear)
    cradle = cradle.cut(
        cq.Workplane("XY").circle(1.6).extrude(BASE_T)
        .translate((sx*(cr_L/2+7), 0, 0)))
# rear snap-lock cantilever (rear wall, X-)
latch_x = -cr_L/2 - 1.5
arm = (cq.Workplane("XY")
       .box(3.0, LATCH_W, CR_H+8.0, centered=(True, True, False))
       .translate((latch_x, 0, 0)))
hook = (cq.Workplane("XY")
        .box(4.5, LATCH_W, 4.0, centered=(True, True, False))
        .translate((latch_x+3.75, 0, CR_H+4.0)))
thumb = (cq.Workplane("XY")
         .box(6.0, LATCH_W, 3.0, centered=(True, True, False))
         .translate((latch_x-4.5+1.5, 0, CR_H+5.0)))
latch = arm.union(hook).union(thumb)
latch = latch.edges("|Y and >X and >Z").chamfer(1.5)

# ---------------- Connector (male, on cradle base) ----------------
con = (cq.Workplane("XY")
       .box(CON_L, CON_W, CON_H, centered=(True, True, False))
       .translate((-BAT_L/2+CON_L/2+6, 0, BASE_T)))
for yoff in (-2.75, 2.75):
    con = con.union(
        cq.Workplane("XY")
        .box(PIN, PIN, 5.0, centered=(True, True, False))
        .translate((-BAT_L/2+CON_L/2+6, yoff, BASE_T+CON_H)))

# ---------------- Positioning ----------------
bat_assembled = bat.translate((0, 0, BASE_T + 0.2))
EXPLODE = 55.0
bat_exploded = bat.translate((0, 0, BASE_T + EXPLODE))

# ---------------- Exports ----------------
out = "/tmp/batmount/"
cq.exporters.export(bat, out+"battery_cassette.step")
cq.exporters.export(cradle.union(latch), out+"receiver_cradle.step")
asm = cq.Assembly()
asm.add(cradle.union(latch), name="cradle", color=cq.Color(0.72, 0.74, 0.76))
asm.add(con, name="connector", color=cq.Color(0.95, 0.45, 0.1))
asm.add(bat_assembled, name="battery", color=cq.Color(0.22, 0.22, 0.24))
asm.save(out+"quick_swap_assembly.step")
# STLs for rendering (exploded view)
cq.exporters.export(cradle.union(latch), out+"r_cradle.stl", tolerance=0.05)
cq.exporters.export(con, out+"r_con.stl", tolerance=0.05)
cq.exporters.export(bat_exploded, out+"r_bat.stl", tolerance=0.05)
cq.exporters.export(bat_assembled, out+"r_bat_seated.stl", tolerance=0.05)
print("exports done")
