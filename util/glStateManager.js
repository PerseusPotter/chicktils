export default {
  pushAttrib() {
    GlStateManager.func_179123_a();
  },
  popAttrib() {
    GlStateManager.func_179099_b();
  },
  disableAlpha() {
    GlStateManager.func_179118_c();
  },
  enableAlpha() {
    GlStateManager.func_179141_d();
  },
  /**
   * @param {number} func int
   * @param {number} ref float
   */
  alphaFunc(func, ref) {
    GlStateManager.func_179092_a(func, ref);
  },
  enableLighting() {
    GlStateManager.func_179145_e();
  },
  disableLighting() {
    GlStateManager.func_179140_f();
  },
  /**
   * @param {number} light int
   */
  enableLight(light) {
    GlStateManager.func_179085_a(light);
  },
  /**
   * @param {number} light int
   */
  disableLight(light) {
    GlStateManager.func_179122_b(light);
  },
  enableColorMaterial() {
    GlStateManager.func_179142_g();
  },
  disableColorMaterial() {
    GlStateManager.func_179119_h();
  },
  /**
   * @param {number} face int
   * @param {number} mode int
   */
  colorMaterial(face, mode) {
    GlStateManager.func_179104_a(face, mode);
  },
  disableDepth() {
    GlStateManager.func_179097_i();
  },
  enableDepth() {
    GlStateManager.func_179126_j();
  },
  /**
   * @param {number} depthFunc int
   */
  depthFunc(depthFunc) {
    GlStateManager.func_179143_c(depthFunc);
  },
  /**
   * @param {boolean} flagIn
   */
  depthMask(flagIn) {
    GlStateManager.func_179132_a(flagIn);
  },
  disableBlend() {
    GlStateManager.func_179084_k();
  },
  enableBlend() {
    GlStateManager.func_179147_l();
  },
  /**
   * @param {number} srcFactor int
   * @param {number} dstFactor int
   */
  blendFunc(srcFactor, dstFactor) {
    GlStateManager.func_179112_b(srcFactor, dstFactor);
  },
  tryBlendFuncSeparate(srcFactor, dstFactor, srcFactorAlpha, dstFactorAlpha) {
    GlStateManager.func_179120_a(srcFactor, dstFactor, srcFactorAlpha, dstFactorAlpha);
  },
  enableFog() {
    GlStateManager.func_179127_m();
  },
  disableFog() {
    GlStateManager.func_179106_n();
  },
  /**
   * @param {number} param int
   */
  setFog(param) {
    GlStateManager.func_179093_d(param);
  },
  /**
   * @param {number} param float
   */
  setFogDensity(param) {
    GlStateManager.func_179095_a(param);
  },
  /**
   * @param {number} param float
   */
  setFogStart(param) {
    GlStateManager.func_179102_b(param);
  },
  /**
   * @param {number} param float
   */
  setFogEnd(param) {
    GlStateManager.func_179153_c(param);
  },
  enableCull() {
    GlStateManager.func_179089_o();
  },
  disableCull() {
    GlStateManager.func_179129_p();
  },
  /**
   * @param {number} mode int
   */
  cullFace(mode) {
    GlStateManager.func_179107_e(mode);
  },
  enablePolygonOffset() {
    GlStateManager.func_179088_q();
  },
  disablePolygonOffset() {
    GlStateManager.func_179113_r();
  },
  /**
   *
   * @param {number} factor float
   * @param {number} units float
   */
  doPolygonOffset(factor, units) {
    GlStateManager.func_179136_a(factor, units);
  },
  enableColorLogic() {
    GlStateManager.func_179115_u();
  },
  disableColorLogic() {
    GlStateManager.func_179134_v();
  },
  /**
   * @param {number} opCode int
   */
  colorLogicOp(opCode) {
    GlStateManager.func_179116_f(opCode);
  },
  /**
   * @param {any} param GlStateManager.TexGen
   */
  enableTexGenCoord(param) {
    GlStateManager.func_179087_a(param);
  },
  /**
   * @param {any} param GlStateManager.TexGen
   */
  disableTexGenCoord(param) {
    GlStateManager.func_179100_b(param);
  },
  /**
   * @param {any} texGen GlStateManager.TexGen
   * @param {number} param int
   * @param {number[]?} params FloatBuffer
   */
  texGen(texGen, param, params) {
    if (params) GlStateManager.func_179105_a(texGen, param, params);
    else GlStateManager.func_179149_a(texGen, param);
  },
  /**
   * @param {number} texture int
   */
  setActiveTexture(texture) {
    GlStateManager.func_179138_g(texture);
  },
  enableTexture2D() {
    GlStateManager.func_179098_w();
  },
  disableTexture2D() {
    GlStateManager.func_179090_x();
  },
  /**
   * @returns {number} int
   */
  generateTexture() {
    return GlStateManager.func_179146_y();
  },
  /**
   * @param {number} texture int
   */
  deleteTexture(texture) {
    GlStateManager.func_179150_h(texture);
  },
  /**
   * @param {number} texture int
   */
  bindTexture(texture) {
    GlStateManager.func_179144_i(texture);
  },
  enableNormalize() {
    GlStateManager.func_179108_z();
  },
  disableNormalize() {
    GlStateManager.func_179133_A();
  },
  /**
   * @param {number} mode int
   */
  shadeModel(mode) {
    GlStateManager.func_179103_j(mode);
  },
  enableRescaleNormal() {
    GlStateManager.func_179091_B();
  },
  disableRescaleNormal() {
    GlStateManager.func_179101_C();
  },
  /**
   * @param {number} x int
   * @param {number} y int
   * @param {number} width int
   * @param {number} height int
   */
  viewport(x, y, width, height) {
    GlStateManager.func_179083_b(x, y, width, height);
  },
  /**
   * @param {boolean} red
   * @param {boolean} green
   * @param {boolean} blue
   * @param {boolean} alpha
   */
  colorMask(red, green, blue, alpha) {
    GlStateManager.func_179135_a(red, green, blue, alpha);
  },
  /**
   * @param {number} depth double
   */
  clearDepth(depth) {
    GlStateManager.func_179151_a(depth);
  },
  /**
   * @param {number} red float
   * @param {number} green float
   * @param {number} blue float
   * @param {number} alpha float
   */
  clearColor(red, green, blue, alpha) {
    GlStateManager.func_179082_a(red, green, blue, alpha);
  },
  /**
   * @param {number} mask int
   */
  clear(mask) {
    GlStateManager.func_179086_m(mask);
  },
  /**
   * @param {number} mode int
   */
  matrixMode(mode) {
    GlStateManager.func_179128_n(mode);
  },
  loadIdentity() {
    GlStateManager.func_179096_D();
  },
  pushMatrix() {
    GlStateManager.func_179094_E();
  },
  popMatrix() {
    GlStateManager.func_179121_F();
  },
  /**
   * @param {number} pname int
   * @param {number[]} params FloatBuffer
   */
  getFloat(pname, params) {
    GlStateManager.func_179111_a(pname, params);
  },
  /**
   * @param {number} left double
   * @param {number} right double
   * @param {number} bottom double
   * @param {number} top double
   * @param {number} zNear double
   * @param {number} zFar double
   */
  ortho(left, right, bottom, top, zNear, zFar) {
    GlStateManager.func_179130_a(left, right, bottom, top, zNear, zFar);
  },
  /**
   * @param {number} angle float
   * @param {number} x float
   * @param {number} y float
   * @param {number} z float
   */
  rotate(angle, x, y, z) {
    GlStateManager.func_179114_b(angle, x, y, z);
  },
  /**
   * @param {number} x double
   * @param {number} y double
   * @param {number} z double
   */
  scale(x, y, z) {
    // func_179152_a float
    GlStateManager.func_179139_a(x, y, z);
  },
  /**
   * @param {number} x double
   * @param {number} y double
   * @param {number} z double
   */
  translate(x, y, z) {
    // func_179109_b float
    GlStateManager.func_179137_b(x, y, z);
  },
  /**
   * @param {number[]} matrix FloatBuffer
   */
  multMatrix(matrix) {
    GlStateManager.func_179110_a(matrix);
  },
  /**
   * @param {number} colorRed float
   * @param {number} colorGreen float
   * @param {number} colorBlue float
   * @param {number?} colorAlpha float
   */
  color(colorRed, colorGreen, colorBlue, colorAlpha) {
    GlStateManager.func_179131_c(colorRed, colorGreen, colorBlue, colorAlpha ?? 1);
  },
  resetColor() {
    GlStateManager.func_179117_G();
  },
  /**
   * @param {number} list int
   */
  callList(list) {
    GlStateManager.func_179148_o(list);
  }
};