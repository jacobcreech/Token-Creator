import { FC, useState, Fragment, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import { WebBundlr } from '@bundlr-network/client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

import { notify } from '../utils/notifications';

const bundlers = [
  { id: 1, network: 'mainnet-beta', name: 'https://node1.bundlr.network' },
  { id: 2, network: 'devnet', name: 'https://devnet.bundlr.network'},
]

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const UploadMetadata: FC = ({}) => {
  const wallet = useWallet();
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [bundlr, setBundlr] = useState(null);
  const [selected, setSelected] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metadataUrl, setMetadataUrl] = useState(null);

  useEffect(() => {
    if (wallet && wallet.connected) {
      async function connectProvider() {
        console.log(wallet);
        await wallet.connect();
        const provider = wallet.wallet.adapter;
        await provider.connect();
        setProvider(provider);
      }
      connectProvider();
    }
  });

  useEffect(() => {

  });

  const initializeBundlr = async () => {
    // initialise a bundlr client
    let bundler;
    if (selected.name === 'https://devnet.bundlr.network') {
      bundler = new WebBundlr(
        `${selected.name}`,
        'solana',
        provider,
        { providerUrl: 'https://api.devnet.solana.com' }
      );
    } else {
       bundler = new WebBundlr(
        `${selected.name}`,
        'solana',
        provider
      );
    }

    console.log(bundler)

    try {
      // Check for valid bundlr node
      await bundler.utils.getBundlerAddress('solana');
    } catch (err) {
      notify({ type: 'error', message: `${err}` });
      return;
    }
    try {
      await bundler.ready();
    } catch (err) {
      notify({ type: 'error', message: `${err}` });
      return;
    } //@ts-ignore
    if (!bundler.address) {
      notify({
        type: 'error',
        message: 'Unexpected error: bundlr address not found',
      });
    }
    notify({
      type: 'success',
      message: `Connected to ${selected.network}`,
    });
    setAddress(bundler?.address);
    setBundlr(bundler);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    let reader = new FileReader();
    if (file) {
      setSelectedImage(file.name);
      reader.onload = function () {
        if (reader.result) {
          setImageFile(Buffer.from(reader.result as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleMetadataChange = (event) => {
    const file = event.target.files[0];
    let reader = new FileReader();
    if (file) {
      setSelectedFile(file.name);
      reader.onload = function () {
        if (reader.result) {
          setMetadata(Buffer.from(reader.result as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadImage = async () => {
    const price = await bundlr.utils.getPrice('solana', imageFile.length);
    let amount = bundlr.utils.unitConverter(price);
    amount = amount.toNumber();

    const loadedBalance = await bundlr.getLoadedBalance();
    let balance = bundlr.utils.unitConverter(loadedBalance.toNumber());
    balance = balance.toNumber();

    if (balance < amount) {
      await bundlr.fund(LAMPORTS_PER_SOL);
    }

    const imageResult = await bundlr.uploader.upload(imageFile, [
      { name: 'Content-Type', value: 'image/png' },
    ]);

    const arweaveImageUrl = `https://arweave.net/${imageResult.data.id}?ext=png`;

    if (arweaveImageUrl) {
      setImageUrl(arweaveImageUrl);
    }
  };

  const uploadMetadata = async () => {
    const price = await bundlr.utils.getPrice('solana', metadata.length);
    let amount = bundlr.utils.unitConverter(price);
    amount = amount.toNumber();

    const loadedBalance = await bundlr.getLoadedBalance();
    let balance = bundlr.utils.unitConverter(loadedBalance.toNumber());
    balance = balance.toNumber();

    if (balance < amount) {
      await bundlr.fund(LAMPORTS_PER_SOL);
    }

    const metadataResult = await bundlr.uploader.upload(metadata, [
      { name: 'Content-Type', value: 'application/json' },
    ]);
    const arweaveMetadataUrl = `https://arweave.net/${metadataResult.data.id}`;

    setMetadataUrl(arweaveMetadataUrl);
  };

  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
      <div className='border-t border-gray-200 px-4 py-5 sm:p-0'>
        <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
          <div className='md:col-span-1'>
            <div className='px-4 sm:px-0'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Bundler
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                This is the bundler you will be using to upload your files
                to Arweave.
              </p>
            </div>
          </div>
          <div className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1'>
            <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
              <Listbox value={selected} onChange={setSelected}>
                {() => (
                  <>
                    <div className="mt-1 relative">
                      <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <span className="block truncate">{!selected ? 'Select Network' : selected.network}</span>
                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>

                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                          {bundlers.map((bundler) => (
                            <Listbox.Option
                              key={bundler.id}
                              className={({ active }) =>
                                classNames(
                                  active ? 'text-white bg-purple-500' : 'text-gray-900',
                                  'cursor-default select-none relative py-2 pl-3 pr-9'
                                )
                              }
                              value={bundler}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                    {bundler.network}
                                  </span>

                                  {selected ? (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-purple-500',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
          </div>
          <div className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1'>
            <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
              <button
                className='items-center px-3 py-2 text-xs btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ...'
                onClick={async () => await initializeBundlr()}>
                Connect
              </button>
            </div>
          </div>
        </div>
        <div className='hidden sm:block' aria-hidden='true'>
          <div className='py-5'>
            <div className='border-t border-gray-200' />
          </div>
        </div>
        <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
          <div className='md:col-span-1'>
            <div className='px-4 sm:px-0'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Image URL
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                The Arweave URL for your stored image. Set this as the{' '}
                <code className='text-purple-500 bg-purple-100'>image</code> and{' '}
                <code className='text-purple-500 bg-purple-100'>uri</code> values in your
                metadata file.
              </p>
            </div>
          </div>
          <div className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1'>
            {!imageUrl ? (
              <div className='mt-1 sm:mt-0 sm:col-span-1'>
                <div className='max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      stroke='currentColor'
                      fill='none'
                      viewBox='0 0 48 48'
                      aria-hidden='true'>
                      <path
                        d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <div className='flex text-sm text-gray-600'>
                      <label
                        htmlFor='image-upload'
                        className='relative cursor-pointer bg-white rounded-md font-medium text-purple-500 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'>
                        <span>Upload an image</span>
                        <input
                          id='image-upload'
                          name='image-upload'
                          type='file'
                          className='sr-only'
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className='pl-1'>or drag and drop</p>
                    </div>
                    {!selectedImage ? null : (
                      <p className='text-sm text-gray-500'>{selectedImage}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
                <a href={imageUrl} target='_blank' rel='noreferrer'>
                  {imageUrl}
                </a>
              </div>
            )}
          </div>
          <div className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1'>
            <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
              {!imageUrl && (
                <button
                  className='px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ...'
                  onClick={async () => uploadImage()}
                  disabled={!bundlr}>
                  Upload Image
                </button>
              )}
            </div>
          </div>
        </div>
        <div className='hidden sm:block' aria-hidden='true'>
          <div className='py-5'>
            <div className='border-t border-gray-200' />
          </div>
        </div>
        <div className='py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
          <div className='md:col-span-1'>
            <div className='px-4 sm:px-0'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Metadata URL
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                The Arweave URL where your metadata is saved. You will use this
                to create your token.
              </p>
            </div>
          </div>
          <div className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1'>
            {!metadataUrl ? (
              <div className='mt-1 sm:mt-0 sm:col-span-1'>
                <div className='max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
                  <div className='space-y-1 text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      stroke='currentColor'
                      fill='none'
                      viewBox='0 0 48 48'
                      aria-hidden='true'>
                      <path
                        d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <div className='flex text-sm text-gray-600'>
                      <label
                        htmlFor='file-upload'
                        className='relative cursor-pointer bg-white rounded-md font-medium text-purple-500 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500'>
                        <span>Upload a file</span>
                        <input
                          id='file-upload'
                          name='file-upload'
                          type='file'
                          className='sr-only'
                          onChange={handleMetadataChange}
                        />
                      </label>
                      <p className='pl-1'>or drag and drop</p>
                    </div>
                    {!selectedFile ? null : (
                      <p className='text-sm text-gray-500'>{selectedFile}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
                <a href={metadataUrl} target='_blank' rel='noreferrer'>
                  {metadataUrl}
                </a>
              </div>
            )}
          </div>
          <div className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1'>
            <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
              {!metadataUrl && (
                <button
                  className='items-center px-3 py-2 text-xs btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ...'
                  onClick={async () => uploadMetadata()}
                  disabled={!bundlr}>
                  Upload Metadata
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
