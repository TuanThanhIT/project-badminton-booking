export const flyToCart = (imgEl: HTMLImageElement, cartEl: HTMLElement) => {
  const imgRect = imgEl.getBoundingClientRect();
  const cartRect = cartEl.getBoundingClientRect();

  // clone ảnh
  const flying = imgEl.cloneNode(true) as HTMLImageElement;

  // style ban đầu
  Object.assign(flying.style, {
    position: "fixed",
    left: `${imgRect.left}px`,
    top: `${imgRect.top}px`,
    width: `${imgRect.width}px`,
    height: `${imgRect.height}px`,
    zIndex: 9999,
    transition: "all 0.7s cubic-bezier(0.4,0,0.2,1)",
    pointerEvents: "none",
  });

  document.body.appendChild(flying);

  // animate
  requestAnimationFrame(() => {
    flying.style.left = `${cartRect.left + cartRect.width / 2}px`;
    flying.style.top = `${cartRect.top + cartRect.height / 2}px`;
    flying.style.width = "30px";
    flying.style.height = "30px";
    flying.style.opacity = "0.5";
    flying.style.transform = "translate(-50%, -50%) scale(0.3)";
  });

  // xoá sau khi xong
  setTimeout(() => {
    flying.remove();
  }, 700);
};
