
import { extractZipServerAction } from "@/lib/actions/file.actions";

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-pro",
//     contents: "Explain how AI works in a few words",
    
//   });
//   console.log(response.text );
// }

// main();


const page = async() => {

  // const files = await extractZipServerAction();
  return (
    <div>
      <h1>dashboard</h1>
      <button >Generate Content</button>
      {/* <pre>{JSON.stringify(files)}</pre> */}
    </div>
  );
};

export default page;