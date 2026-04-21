(function (global) {
  const RoundState = Object.freeze({
    NuevaRonda: "NuevaRonda",
    RondaEnProgreso: "RondaEnProgreso",
    RondaFinalizada: "RondaFinalizada"
  });

  global.RoundState = RoundState;
})(window);
