import { Fragment, useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

const API_URL = 'https://flask-hello-world2-three.vercel.app/get_all_contents';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

async function fetchRepoFiles(repoName) {
  try {
    const response = await axios.post(API_URL, { repo_name: repoName });
    return response.data.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      contents: file.contents,
      online: true,
    }));
  } catch (error) {
    console.error('Error fetching data: ', error);
    return [];
  }
}

function Directory({ file, selected, setSelected }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={handleToggle}>{file.name}</button>
      {isOpen && (
        <div>
          {file.contents.map((item) =>
            item.type === 'dir' ? (
              <Directory key={item.id} file={item} selected={selected} setSelected={setSelected} />
            ) : (
              <File key={item.id} file={item} selected={selected} setSelected={setSelected} />
            )
          )}
        </div>
      )}
    </div>
  );
}

function File({ file, selected, setSelected }) {
  return (
    <Listbox.Option
      key={file.id}
      className={({ active }) =>
        classNames(
          active ? 'bg-indigo-600 text-white' : 'text-gray-300',
          'relative cursor-default select-none py-2 pl-3 pr-9'
        )
      }
      value={file}
    >
      {({ selected, active }) => (
        <>
          <div className="flex items-center">
            <span
              className={classNames(
                file.online ? 'bg-green-400' : 'bg-gray-200',
                'inline-block h-2 w-2 flex-shrink-0 rounded-full'
              )}
              aria-hidden="true"
            />
            <span
              className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
            >
              {file.name}
              <span className="sr-only"> is {file.online ? 'online' : 'offline'}</span>
            </span>
          </div>

          {selected ? (
            <span
              className={classNames(
                active ? 'text-white' : 'text-indigo-600',
                'absolute inset-y-0 right-0 flex items-center pr-4'
              )}
            >
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )}
    </Listbox.Option>
  );
}

export function SelectFileDropdown({ selectedRepo }) {
  const [repoFiles, setRepoFiles] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (selectedRepo) {
      fetchRepoFiles(selectedRepo.name).then(files => {
        setRepoFiles(files);
        setSelected(files[0]);
      });
    }
  }, [selectedRepo]); 

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-white">Select File</Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-gray-800 py-1.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                <span
                  aria-label={selected ? (selected.online ? 'Online' : 'Offline') : 'Loading'}
                  className={classNames(
                    selected ? (selected.online ? 'bg-green-400' : 'bg-gray-200') : 'bg-gray-200',
                    'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                  )}
                />
                <span className="ml-3 block truncate">{selected ? selected.name : 'Select a repo first'}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {repoFiles.map((file) =>
                  file.type === 'dir' ? (
                    <Directory key={file.id} file={file} selected={selected} setSelected={setSelected} />
                  ) : (
                    <File key={file.id} file={file} selected={selected} setSelected={setSelected} />
                  )
                )}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}