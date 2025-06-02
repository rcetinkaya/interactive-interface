"use client";
/* import paper from "paper/dist/paper-core.min.js"; */
import { useEffect, useMemo, useRef, useState } from "react";

function PaperClient() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [paper, setPaper] = useState<any>(null);
    const [vInput, setVInput] = useState("");
    const [hInput, setHInput] = useState("");
    const [params, setParams] = useState({
        width: 400,
        height: 300,
        vCount: 2,
        hCount: 2,
        profileThickness: 20,
        customV: [] as number[],
        customH: [] as number[],
    });
    useEffect(() => {
        (async () => {
          const mod = await import("paper/dist/paper-core.min.js");
          setPaper(mod.default || mod); // Bazı bundler'larda `default` içinde geliyor
        })();
      }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setParams({ ...params, [e.target.name]: Number(e.target.value) });
    };

    const addCustomVertical = () => {
        const val = parseFloat(vInput);
        if (!isNaN(val) && val > 0 && val < params.width) {
            setParams((p) => ({ ...p, customV: [...p.customV, val] }));
            setVInput("");
        }
    };

    const addCustomHorizontal = () => {
        const val = parseFloat(hInput);
        if (!isNaN(val) && val > 0 && val < params.height) {
            setParams((p) => ({ ...p, customH: [...p.customH, val] }));
            setHInput("");
        }
    };

    const removeCustomV = (val: number) => {
        setParams((p) => ({ ...p, customV: p.customV.filter((v) => v !== val) }));
    };

    const removeCustomH = (val: number) => {
        setParams((p) => ({ ...p, customH: p.customH.filter((h) => h !== val) }));
    };

    function drawPanels(innerRect: any, vLines: number[], hLines: number[]) {
        const allX = [innerRect.left, ...vLines.map((x) => innerRect.left + x), innerRect.right].sort((a, b) => a - b);
        const allY = [innerRect.top, ...hLines.map((y) => innerRect.top + y), innerRect.bottom].sort((a, b) => a - b);
        let panelIndex = 1;
        for (let i = 0; i < allX.length - 1; i++) {
            for (let j = 0; j < allY.length - 1; j++) {
                const rect = new paper.Rectangle(
                    new paper.Point(allX[i], allY[j]),
                    new paper.Size(allX[i + 1] - allX[i], allY[j + 1] - allY[j])
                );
                const panel = new paper.Path.Rectangle(rect);
                panel.fillColor = new paper.Color(0.9, 0.9, 0.9, 0.4);
                panel.strokeColor = new paper.Color("#999");
                new paper.PointText({
                    point: rect.center,
                    content: `#${panelIndex++}`,
                    justification: "center",
                    fillColor: "black",
                    fontSize: 10,
                });
            }
        }
    }

    const vAuto = useMemo(() => {
        const step = params.width / (params.vCount + 1);
        return Array.from({ length: params.vCount }, (_, i) => Number(((i + 1) * step).toFixed(1)));
    }, [params.width, params.vCount]);

    const hAuto = useMemo(() => {
        const step = params.height / (params.hCount + 1);
        return Array.from({ length: params.hCount }, (_, i) => Number(((i + 1) * step).toFixed(1)));
    }, [params.height, params.hCount]);

    const drawCanvas = () => {
        if (!paper || !canvasRef.current) return;
        const canvas = canvasRef.current;
        paper.setup(canvas);
        paper.project.activeLayer.removeChildren();
        const bg = new paper.Path.Rectangle(new paper.Rectangle(0, 0, canvas.width, canvas.height));
        bg.fillColor = new paper.Color("white");

        const { width, height, vCount, hCount, profileThickness, customV, customH } = params;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const totalWidth = width + profileThickness * 2;
        const totalHeight = height + profileThickness * 2;
        const startX = (canvasWidth - totalWidth) / 2;
        const startY = (canvasHeight - totalHeight) / 2;

        const outerRect = new paper.Rectangle(new paper.Point(startX, startY), new paper.Size(totalWidth, totalHeight));
        const outerPath = new paper.Path.Rectangle(outerRect);
        outerPath.strokeColor = new paper.Color("black");

        const innerRect = new paper.Rectangle(
            new paper.Point(startX + profileThickness, startY + profileThickness),
            new paper.Size(width, height)
        );
        const innerPath = new paper.Path.Rectangle(innerRect);
        innerPath.strokeColor = new paper.Color("#666");
        innerPath.dashArray = [10, 4];

        const vStep = width / (vCount + 1);
        const hStep = height / (hCount + 1);
        const vAuto = Array.from({ length: vCount }, (_, i) => (i + 1) * vStep);
        const hAuto = Array.from({ length: hCount }, (_, i) => (i + 1) * hStep);

        drawPanels(innerRect, [...vAuto, ...customV], [...hAuto, ...customH]);

        vAuto.forEach((mm) => {
            const x = innerRect.left + mm;
            const line = new paper.Path.Line(new paper.Point(x, innerRect.top), new paper.Point(x, innerRect.bottom));
            line.strokeColor = new paper.Color("blue");
        
            new paper.PointText({
                point: new paper.Point(x + 5, innerRect.top + 15),
                content: `${mm.toFixed(2)} mm (soldan)`,
                justification: "left",
                fillColor: "blue",
                fontSize: 10,
            });
        });

        hAuto.forEach((mm) => {
            const y = innerRect.bottom - mm;
            const line = new paper.Path.Line(new paper.Point(innerRect.left, y), new paper.Point(innerRect.right, y));
            line.strokeColor = new paper.Color("red");
        
            new paper.PointText({
                point: new paper.Point(innerRect.left + 5, y - 5),
                content: `${mm.toFixed(2)} mm (zeminden)`,
                justification: "left",
                fillColor: "red",
                fontSize: 10,
            });
        });

        customV.forEach((mm) => {
            const x = innerRect.left + mm;
            const line = new paper.Path.Line(new paper.Point(x, innerRect.top), new paper.Point(x, innerRect.bottom));
            line.strokeColor = new paper.Color("purple");
            line.dashArray = [6, 3];
        
            new paper.PointText({
                point: new paper.Point(x + 5, innerRect.top + 15),
                content: `${mm.toFixed(2)} mm (soldan)`,
                justification: "left",
                fillColor: "purple",
                fontSize: 10,
            });
        });

        customH.forEach((mm) => {
            const y = innerRect.bottom - mm;
            const line = new paper.Path.Line(new paper.Point(innerRect.left, y), new paper.Point(innerRect.right, y));
            line.strokeColor = new paper.Color("orange");
            line.dashArray = [6, 3];
        
            new paper.PointText({
                point: new paper.Point(innerRect.left + 5, y - 5),
                content: `${mm.toFixed(2)} mm (zeminden)`,
                justification: "left",
                fillColor: "orange",
                fontSize: 10,
            });
        });

        new paper.PointText({
            point: new paper.Point(innerRect.left + width / 2, innerRect.top - 30),
            content: `Genişlik: ${width} mm`,
            justification: "center",
            fillColor: "black",
            fontSize: 14,
        });

        const heightText = new paper.PointText({
            point: new paper.Point(innerRect.left - 30, innerRect.top + height / 2),
            content: `Yükseklik: ${height} mm`,
            justification: "center",
            fillColor: "black",
            fontSize: 14,
        });
        heightText.rotate(-90);

        // Profil kalınlığı etiketi
        new paper.PointText({
            point: new paper.Point(startX - 5, startY - 10),
            content: `Profil Kalınlığı: ${profileThickness} mm`,
            justification: "left",
            fillColor: "#444",
            fontSize: 12,
        });
      };

    useEffect(() => {
        drawCanvas();
    }, [paper,params]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-6 gap-8">
            {/* Form */}
            <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex flex-col text-sm">
                    Genişlik (mm)
                    <input name="width" type="number" value={params.width} onChange={handleChange} className="border p-2 rounded mt-1" />
                </label>
                <label className="flex flex-col text-sm">
                    Yükseklik (mm)
                    <input name="height" type="number" value={params.height} onChange={handleChange} className="border p-2 rounded mt-1" />
                </label>
                <label className="flex flex-col text-sm">
                    Profil Kalınlığı (mm)
                    <input name="profileThickness" type="number" value={params.profileThickness} onChange={handleChange} className="border p-2 rounded mt-1" />
                </label>
                <label className="flex flex-col text-sm">
                    Dikey Sayısı
                    <input name="vCount" type="number" value={params.vCount} onChange={handleChange} className="border p-2 rounded mt-1" />
                </label>
                <label className="flex flex-col text-sm">
                    Yatay Sayısı
                    <input name="hCount" type="number" value={params.hCount} onChange={handleChange} className="border p-2 rounded mt-1" />
                </label>
                <div className="col-span-full flex flex-wrap gap-4">
                <div className="flex gap-2 items-end">
                    <label className="flex flex-col text-sm w-full">
                        Yeni Dikey Kayıt (mm)
                        <input type="number" value={vInput} onChange={(e) => setVInput(e.target.value)} className="border p-2 rounded mt-1" />
                    </label>
                    <button onClick={addCustomVertical} className="px-4 py-2 bg-blue-600 text-white rounded h-fit">Ekle</button>
                </div>
                <div className="flex gap-2 items-end">
                    <label className="flex flex-col text-sm w-full">
                        Yeni Yatay Kayıt (mm)
                        <input type="number" value={hInput} onChange={(e) => setHInput(e.target.value)} className="border p-2 rounded mt-1" />
                    </label>
                    <button onClick={addCustomHorizontal} className="px-4 py-2 bg-red-600 text-white rounded h-fit">Ekle</button>
                </div>
                </div>
               
            </div>

            {/* Kayıt listeleri */}
            <div className="flex flex-wrap gap-12 justify-center w-full max-w-4xl">
                <div>
                    <h3 className="font-semibold text-center mb-2">Dikey Kayıtlar</h3>
                    <ul className="list-disc ml-4">
                        {vAuto.map((v) => (
                            <li key={`auto-v-${v}`} className="text-blue-600">{v} mm (otomatik)</li>
                        ))}
                        {params.customV.map((v) => (
                            <li key={`custom-v-${v}`} className="text-purple-600">
                                {v} mm
                                <button onClick={() => removeCustomV(v)} className="ml-2 text-red-600 underline">Sil</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-center mb-2">Yatay Kayıtlar</h3>
                    <ul className="list-disc ml-4">
                        {hAuto.map((h) => (
                            <li key={`auto-h-${h}`} className="text-red-600">{h} mm (otomatik)</li>
                        ))}
                        {params.customH.map((h) => (
                            <li key={`custom-h-${h}`} className="text-orange-500">
                                {h} mm
                                <button onClick={() => removeCustomH(h)} className="ml-2 text-red-600 underline">Sil</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Çizim */}
            <canvas ref={canvasRef} width={800} height={600} className="border border-gray-300 mx-auto block" />

            {/* Renk Açıklamaları */}
            <div className="mt-6 p-4 border text-sm w-full max-w-xl bg-gray-50 rounded">
                <h4 className="font-bold mb-2">Renk Açıklamaları:</h4>
                <ul className="list-disc ml-4 space-y-1">
                    <li><span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: "black" }} /> Dış Çerçeve</li>
                    <li><span className="inline-block w-4 h-4 mr-2" style={{ backgroundColor: "#666" }} /> İç Çalışma Alanı</li>
                    <li><span className="inline-block w-4 h-4 mr-2 bg-blue-600" /> Otomatik Dikey Kayıt</li>
                    <li><span className="inline-block w-4 h-4 mr-2 bg-red-600" /> Otomatik Yatay Kayıt</li>
                    <li><span className="inline-block w-4 h-4 mr-2 bg-purple-600" /> Özel Dikey Kayıt</li>
                    <li><span className="inline-block w-4 h-4 mr-2 bg-orange-400" /> Özel Yatay Kayıt</li>
                    <li><span className="inline-block w-4 h-4 mr-2 bg-gray-300" /> Panel Alanları</li>
                </ul>
            </div>
        </div>
    );
}

export default PaperClient;
