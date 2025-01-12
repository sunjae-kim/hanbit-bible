import { Dialog, DialogPanel } from '@headlessui/react'

interface ModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  children: React.ReactNode
}

function Modal(props: ModalProps) {
  const { isOpen, setIsOpen } = props

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      transition
      className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0"
    >
      <DialogPanel className="max-h-[calc(100vh-32px)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-lg bg-white">
        {props.children}
      </DialogPanel>
    </Dialog>
  )
}

export default Modal
