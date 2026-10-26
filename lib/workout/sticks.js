// Stick-figure start/finish frames for exercises that have no photo yet.
// Side view in a 220×150 box, floor at y = 140. Each frame lists joint points;
// "far" limbs are drawn darker behind the body.

const FLOOR = 140;

export const STICKS = {
  "bird-dog": {
    frames: [
      {
        head: [156, 84], shoulder: [140, 92], hip: [85, 92],
        arm: [[140, 116], [140, 138]], farArm: [[136, 116], [136, 138]],
        leg: [[85, 138], [50, 138]], farLeg: [[81, 138], [46, 138]],
      },
      {
        head: [154, 80], shoulder: [140, 92], hip: [85, 92],
        arm: [[163, 96], [188, 100]], farArm: [[136, 116], [136, 138]],
        leg: [[85, 138], [50, 138]], farLeg: [[58, 92], [28, 90]],
      },
    ],
  },
  "hollow-hold": {
    frames: [
      {
        head: [166, 131], shoulder: [150, 134], hip: [100, 134],
        arm: [[128, 136], [106, 136]],
        leg: [[62, 136], [24, 136]],
      },
      {
        head: [163, 118], shoulder: [148, 122], hip: [100, 134],
        arm: [[158, 103], [180, 90]],
        leg: [[62, 128], [25, 119]],
      },
    ],
  },
  "copenhagen-plank": {
    scene: [
      [[14, 100], [72, 100]],
      [[20, 100], [20, FLOOR]],
      [[66, 100], [66, FLOOR]],
    ],
    frames: [
      {
        head: [184, 109], shoulder: [170, 117], hip: [112, 132],
        arm: [[170, 138], [196, 138]], farArm: [[150, 112], [128, 124]],
        leg: [[76, 110], [40, 101]], farLeg: [[80, 138], [48, 139]],
      },
      {
        head: [184, 106], shoulder: [170, 114], hip: [110, 107],
        arm: [[170, 138], [196, 138]], farArm: [[150, 98], [128, 104]],
        leg: [[75, 104], [40, 101]], farLeg: [[86, 124], [70, 138]],
      },
    ],
  },
};

export function sticksFor(exId) {
  return STICKS[exId] ?? null;
}
