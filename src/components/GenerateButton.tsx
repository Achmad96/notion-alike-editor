import '@/app/generate-button.style.css';
interface IGenerateButton {
  generatingStatus: 'generate' | 'regenerate' | null;
  handleGenerate: (isRegenareate: boolean) => Promise<void>;
  handleCancel: () => void;
  children: React.ReactNode | string;
}

const GenerateButton = ({ children, generatingStatus, handleGenerate, handleCancel }: IGenerateButton) => {
  return (
    <button
      className={`generate-button absolute bottom-5 btn h-14 w-36 rounded-md bg-base-200 hover:text-gray-500 focus:border-none focus:outline-none`}
      onClick={async (event) => {
        event.preventDefault();
        if (!generatingStatus) {
          await handleGenerate(false);
          return;
        }
        handleCancel();
      }}>
      {children}
    </button>
  );
};
export default GenerateButton;
