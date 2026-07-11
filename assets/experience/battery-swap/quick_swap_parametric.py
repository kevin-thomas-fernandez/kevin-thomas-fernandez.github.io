"""
Quick-swap battery mount - HORIZONTAL SLIDE-IN (not top drop).
Battery slides in from the front on dovetail rails; connector
auto-mates at the rear wall; front snap latch locks the pack.
Units: mm
"""
import cadquery as cq

BAT_L, BAT_W, BAT_H = 78.0, 42.0, 34.0
WALL, BASE_T, CLR = 5.0, 4.0, 0.4
RAIL_H, RAIL_D = 6.0, 3.0          # horizontal dovetail rib: height, depth
CON_L, CON_W, CON_H = 8.0, 16.0, 11.0   # connector block on rear wall
PIN = 3.0
LATCH_W = 14.0

# ---------------- Battery cassette ----------------
bat = cq.Workplane("XY").box(BAT_L, BAT_W, BAT_H, centered=(True, True, False))
bat = bat.edges("|Z and <X").chamfer(2.0)          # lead-in at rear (insertion end)
# horizontal rails along full length, both sides, at mid height
for sgn in (1, -1):
    rib = (cq.Workplane("XY")
           .box(BAT_L, RAIL_D*2, RAIL_H, centered=(True, True, False))
           .translate((0, sgn*(BAT_W/2), BAT_H/2 - RAIL_H/2)))
    bat = bat.union(rib)
# connector recess on REAR face (X-)
bat = bat.cut(
    cq.Workplane("XY")
    .box(CON_L+CLR, CON_W+2*CLR, CON_H+2*CLR, centered=(True, True, False))
    .translate((-BAT_L/2 + (CON_L+CLR)/2 - 0.001, 0, BAT_H/2 - (CON_H+2*CLR)/2 + 6)))
# latch notch on underside FRONT
bat = bat.cut(
    cq.Workplane("XY")
    .box(5.0, LATCH_W+2*CLR, 3.5, centered=(True, True, False))
    .translate((BAT_L/2 - 8.0, 0, 0)))
# pull tab on front face
tab = (cq.Workplane("XY")
       .box(4.0, 20.0, 10.0, centered=(True, True, False))
       .translate((BAT_L/2 + 2.0, 0, BAT_H/2 - 5.0)))
bat = bat.union(tab)

# ---------------- Receiver cradle ----------------
IN_W = BAT_W + 2*CLR
cr_L = BAT_L + WALL + 6.0                     # rear wall + open front overhang
cr_W = IN_W + 2*(WALL + RAIL_D)
CR_H = BASE_T + BAT_H*0.75
cx = -BAT_L/2 - WALL + cr_L/2                 # cradle spans rear wall to near front
cradle = cq.Workplane("XY").box(cr_L, cr_W, CR_H, centered=(True, True, False)).translate((cx, 0, 0))
# pocket: open at front (+X), bounded by rear wall
pocket = (cq.Workplane("XY")
          .box(cr_L - WALL, IN_W, CR_H, centered=(True, True, False))
          .translate((cx + WALL/2, 0, BASE_T)))
cradle = cradle.cut(pocket)
# horizontal dovetail grooves through side walls (full length incl. front edge)
for sgn in (1, -1):
    groove = (cq.Workplane("XY")
              .box(cr_L - WALL, RAIL_D*2 + 2*CLR, RAIL_H + 2*CLR, centered=(True, True, False))
              .translate((cx + WALL/2, sgn*(IN_W/2), BASE_T + BAT_H/2 - RAIL_H/2 - CLR)))
    cradle = cradle.cut(groove)
# entry chamfers on front edges of walls
cradle = cradle.faces(">X").edges("|Z").chamfer(1.5)
# lightening cutouts in base
for xoff in (-22, 0):
    cradle = cradle.cut(
        cq.Workplane("XY")
        .box(16, 24, BASE_T, centered=(True, True, False))
        .translate((xoff, 0, 0)))
# mounting ears
for sy in (1, -1):
    ear = (cq.Workplane("XY")
           .box(12, 8, BASE_T, centered=(True, True, False))
           .translate((cx, sy*(cr_W/2 + 4 - 0.001), 0)))
    cradle = cradle.union(ear)
    cradle = cradle.cut(
        cq.Workplane("XY").circle(1.6).extrude(BASE_T)
        .translate((cx, sy*(cr_W/2 + 4), 0)))
# front snap latch: cantilever from base, hook rises into battery notch
arm = (cq.Workplane("XY")
       .box(3.0, LATCH_W, BASE_T + 10.0, centered=(True, True, False))
       .translate((BAT_L/2 - 8.0, 0, 0)))
hook = (cq.Workplane("XY")
        .box(4.5, LATCH_W, 3.0, centered=(True, True, False))
        .translate((BAT_L/2 - 8.0 + 0.75, 0, BASE_T + 10.0)))
ramp = (cq.Workplane("XY")
        .box(6.0, LATCH_W, 2.5, centered=(True, True, False))
        .translate((BAT_L/2 - 2.0, 0, BASE_T + 8.0)))
latch = arm.union(hook).union(ramp)

# ---------------- Connector on rear wall (pins point +X) ----------------
con = (cq.Workplane("XY")
       .box(CON_L, CON_W, CON_H, centered=(True, True, False))
       .translate((-BAT_L/2 + CON_L/2 - 1.0, 0, BASE_T + BAT_H/2 - CON_H/2 + 6)))
for yoff in (-4.0, 4.0):
    con = con.union(
        cq.Workplane("XY")
        .box(5.0, PIN, PIN, centered=(True, True, False))
        .translate((-BAT_L/2 + CON_L + 1.0, yoff, BASE_T + BAT_H/2 + 4.5)))

# ---------------- Positioning ----------------
bat_seated = bat.translate((0, 0, BASE_T))
bat_slid_out = bat.translate((BAT_L*0.85, 0, BASE_T))   # pulled out along +X

out = "/tmp/batmount/"
cq.exporters.export(bat, out+"battery_cassette.step")
cq.exporters.export(cradle.union(latch), out+"receiver_cradle.step")
asm = cq.Assembly()
asm.add(cradle.union(latch), name="cradle", color=cq.Color(0.72, 0.74, 0.76))
asm.add(con, name="connector", color=cq.Color(0.95, 0.45, 0.1))
asm.add(bat_seated, name="battery", color=cq.Color(0.22, 0.22, 0.24))
asm.save(out+"quick_swap_assembly.step")
cq.exporters.export(cradle.union(latch), out+"r_cradle.stl", tolerance=0.05)
cq.exporters.export(con, out+"r_con.stl", tolerance=0.05)
cq.exporters.export(bat_slid_out, out+"r_bat.stl", tolerance=0.05)
cq.exporters.export(bat_seated, out+"r_bat_seated.stl", tolerance=0.05)
print("exports done")
