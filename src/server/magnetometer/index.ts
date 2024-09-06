export const magnetometer = {
  onData: (cb: (data: { x: number; y: number; z: number }) => void) => {
    setInterval(
      () => cb({ x: Math.random(), y: Math.random(), z: Math.random() }),
      1000
    );
  },
};
