import JSZip from "jszip";

async function downloadDrivers() {
	const response = await fetch(
		"https://api.github.com/repos/leaphy-robotics/leaphy-firmware/contents/drivers",
	);
	const data = await response.json();
	const files = data.map(({ download_url }) => download_url);
	const zip = new JSZip();

	await Promise.all(
		files.map(async (url) => {
			const res = await fetch(url);
			zip.file(url.split("/").pop(), await res.blob());
		}),
	);

	const a = document.createElement("a");
	const url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
	a.href = url;
	a.download = "leaphy-drivers.zip";
	a.click();
	URL.revokeObjectURL(url);
}

export { downloadDrivers };
