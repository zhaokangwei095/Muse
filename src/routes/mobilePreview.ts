import { Request, Response } from 'express';

// Mobile device preview page - renders the app inside phone-sized iframes
// so responsive breakpoints behave as on a real device.
export function mobilePreviewHandler(_req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title>Muse Mobile Preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #1a1a2e;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    gap: 20px;
  }
  .toolbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .toolbar button {
    padding: 8px 18px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.08);
    color: #cfd8ff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
  }
  .toolbar button:hover { background: rgba(255,255,255,0.18); }
  .toolbar button.active {
    background: linear-gradient(90deg, #2170e4, #0058be);
    color: #fff;
    border-color: transparent;
  }
  .size-label {
    color: rgba(255,255,255,0.5);
    font-size: 12px;
    margin-top: 8px;
    text-align: center;
  }
  .phone-frame {
    background: #0d0d14;
    border-radius: 44px;
    padding: 12px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.08);
    position: relative;
  }
  .phone-notch {
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    width: 110px;
    height: 26px;
    background: #0d0d14;
    border-radius: 999px;
    z-index: 10;
  }
  iframe {
    display: block;
    border: none;
    border-radius: 34px;
    background: #f8f9ff;
    transition: width .3s, height .3s;
  }
</style>
</head>
<body>
  <div class="toolbar" id="toolbar"></div>
  <div class="phone-frame">
    <div class="phone-notch"></div>
    <iframe id="preview" src="/" title="Muse mobile preview"></iframe>
  </div>
  <div class="size-label" id="sizeLabel"></div>

<script>
  const devices = [
    { name: 'iPhone 14 Pro', w: 393, h: 852 },
    { name: 'iPhone SE', w: 375, h: 667 },
    { name: 'Pixel 7', w: 412, h: 915 },
    { name: 'iPad Mini', w: 768, h: 1024 },
  ];
  const toolbar = document.getElementById('toolbar');
  const frame = document.getElementById('preview');
  const label = document.getElementById('sizeLabel');

  devices.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.textContent = d.name;
    btn.onclick = () => {
      frame.style.width = d.w + 'px';
      frame.style.height = d.h + 'px';
      label.textContent = d.name + ' - ' + d.w + ' x ' + d.h;
      toolbar.querySelectorAll('button').forEach((b, j) => b.classList.toggle('active', j === i));
    };
    toolbar.appendChild(btn);
    if (i === 0) btn.onclick();
  });
</script>
</body>
</html>`);
}
