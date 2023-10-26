import { Fragment, useState, useEffect, useCallback, useMemo } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import axios from 'axios';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const useGithubRepos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);

  useEffect(() => {
    const fetchGithubRepos = async () => {
      try {
        const response = await axios.get('https://flask-hello-world2-three.vercel.app/github_repos');
        const mappedRepos = response.data.map(repo => ({
          id: repo.id,
          name: repo.name,
          online: true,
        }));
        setGithubRepos(mappedRepos);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchGithubRepos();
  }, []);

  return { githubRepos, loading, error };
};

export function Dropdown({ selectedRepo, setSelectedRepo }) {
  const { githubRepos, loading, error } = useGithubRepos();

  const handleSetSelectedRepo = useCallback((repo) => {
    setSelectedRepo(repo);
    console.log(`selected-repo-name-${repo.name}`);
  }, []);

  useEffect(() => {
    if (githubRepos.length > 0 && !selectedRepo) {
      handleSetSelectedRepo(githubRepos[0]);
    }
  }, [githubRepos, selectedRepo, handleSetSelectedRepo]);

  if (loading) return 'Loading...';
  if (error) return 'An error occurred';

  return (
    <Listbox value={selectedRepo} onChange={setSelectedRepo} id={selectedRepo ? `selected-repo-name-${selectedRepo.name}` : 'selected-repo-name'}>
    {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium leading-6 text-white">Select Repo</Listbox.Label>
          <div className="relative mt-2">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-gray-800 py-1.5 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
              <span className="flex items-center">
              <span aria-label={selectedRepo ? (selectedRepo.online ? 'Online' : 'Offline') : 'Loading'}
  className={classNames(
    selectedRepo ? (selectedRepo.online ? 'bg-green-400' : 'bg-gray-200') : 'bg-gray-200',
    'inline-block h-2 w-2 flex-shrink-0 rounded-full'
  )}
/>
<span className="ml-3 block truncate">{selectedRepo ? selectedRepo.name : 'Loading'}</span>

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
                {githubRepos.map((repo) => (
                  <Listbox.Option
                    key={repo.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-indigo-600 text-white' : 'text-gray-300',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={repo}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          <span
                            className={classNames(
                              repo.online ? 'bg-green-400' : 'bg-gray-200',
                              'inline-block h-2 w-2 flex-shrink-0 rounded-full'
                            )}
                            aria-hidden="true"
                          />
                          <span
                            className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                          >
                            {repo.name}
                            <span className="sr-only"> is {repo.online ? 'online' : 'offline'}</span>
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
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}