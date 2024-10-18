enum SDL_SurfaceFlags {
  None = 0,

  /** Surface uses preallocated pixel memory */
  PREALLOCATED = 1,

  /** Surface needs to be locked to access pixels */
  LOCK_NEEDED = 2,

  /** Surface is currently locked */
  LOCKED = 4,

  /** Surface uses pixel memory allocated with SDL_aligned_alloc() */
  SIMD_ALIGNED = 8,
}
export default SDL_SurfaceFlags;
