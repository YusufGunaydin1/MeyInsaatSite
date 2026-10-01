import { project, layerInfo, type LayerId, type Vertex } from './geometry';

export function initAssembly(root: HTMLElement) {
  const separation = root.querySelector<HTMLInputElement>('[data-assembly-separation]')!;
  const angle = root.querySelector<HTMLInputElement>('[data-assembly-angle]')!;
  const separationOutput = root.querySelector<HTMLOutputElement>('[data-assembly-separation-output]')!;
  const angleOutput = root.querySelector<HTMLOutputElement>('[data-assembly-angle-output]')!;
  const layers = [...root.querySelectorAll<SVGGElement>('[data-model-layer]')];
  const faces = [...root.querySelectorAll<SVGPolygonElement>('[data-vertices]')].map((element) => ({
    element, vertices: JSON.parse(element.dataset.vertices!) as Vertex[],
  }));
  const layerButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-assembly-layer]')];
  const title = root.querySelector<HTMLElement>('[data-assembly-title]')!;
  const description = root.querySelector<HTMLElement>('[data-assembly-description]')!;

  function updateSeparation() {
    const value = Number(separation.value);
    root.dataset.separation = String(value);
    separationOutput.value = `${value}%`;
    for (const layer of layers) {
      const x = Number(layer.dataset.offsetX) * value / 100;
      const y = Number(layer.dataset.offsetY) * value / 100;
      layer.setAttribute('transform', `translate(${x} ${y})`);
    }
  }

  function updateAngle() {
    const value = Number(angle.value);
    root.dataset.rotation = String(value);
    angleOutput.value = `${value}°`;
    faces.forEach(({ element, vertices }) => element.setAttribute('points', project(vertices, value)));
  }

  function selectLayer(id: LayerId) {
    root.dataset.selected = id;
    layerButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.assemblyLayer === id)));
    layers.forEach((layer) => {
      layer.toggleAttribute('data-dimmed', id !== 'all' && layer.dataset.modelLayer !== id);
      layer.toggleAttribute('data-highlighted', layer.dataset.modelLayer === id);
    });
    title.textContent = layerInfo[id].name;
    description.textContent = layerInfo[id].text;
  }

  separation.addEventListener('input', updateSeparation);
  angle.addEventListener('input', updateAngle);
  layerButtons.forEach((button) => button.addEventListener('click', () => selectLayer(button.dataset.assemblyLayer as LayerId)));
  root.querySelectorAll<HTMLButtonElement>('[data-assembly-preset]').forEach((button) => {
    button.addEventListener('click', () => { separation.value = button.dataset.assemblyPreset!; updateSeparation(); });
  });
  root.querySelector('[data-assembly-reset]')!.addEventListener('click', () => {
    separation.value = '45';
    angle.value = '0';
    updateSeparation();
    updateAngle();
    selectLayer('all');
  });
  root.dataset.enhanced = 'true';
  root.dataset.ready = 'true';
}
