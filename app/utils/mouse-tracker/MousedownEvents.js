class MousedownEvents {
  constructor(mousedownEl, mousedownCallback, mouseupCallback) {
    this.mousedownEl = mousedownEl;
    this.down = false;
    this.downPos = { x: -1, y: -1 };
    this.upPos = { x: -1, y: -1 };

    this.onmousedown = this.onmousedown.bind(this, mousedownCallback);
    this.onmouseup = this.onmouseup.bind(this, mouseupCallback);
    this.onleavedocument = this.onleavedocument.bind(this);

    this.addEventListeners();
  }

  addEventListeners() {
    this.mousedownEl.addEventListener('mousedown', this.onmousedown);
    this.mousedownEl.addEventListener('mouseup', this.onmouseup);
    document.addEventListener('mouseout', this.onleavedocument);
  }

  removeEventListeners() {
    this.mousedownEl.removeEventListener('mousedown', this.onmousedown);
    this.mousedownEl.removeEventListener('mouseup', this.onmouseup);
    document.removeEventListener('mouseout', this.onleavedocument);
  }

  destroy() {
    this.removeEventListeners();
  }

  onleavedocument(e) {
    const from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName === 'HTML') {
      this.onmouseup(e);
    }
  }

  onmousedown(callback, e) {
    if (callback) callback();

    this.down = true;
    this.downPos.x = e.pageX;
    this.downPos.y = e.pageY;
  }

  onmouseup(callback, e) {
    if (this.down) {
      this.down = false;
      this.upPos.x = e.pageX;
      this.upPos.y = e.pageY;

      if (callback) callback();
    }
  }
}

export default MousedownEvents;
