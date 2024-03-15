'''import argparse
import os
from typing import List
from llama_index.llms.ollama import Ollama

def build_prompt(query: str, context: List[str]) -> str:
    """
    Builds a prompt for the LLM.

    Args:
    query (str): The original query.
    context (List[str]): The context of the query, returned by embedding search.

    Returns:
    A prompt for the LLM.
    """
    prompt = " ".join(context) + f" The question is: {query}"
    return prompt

def get_LL_response(query: str, context: List[str], llm: Ollama) -> str:
    """
    Queries the LLM to get a response to the question.

    Args:
    query (str): The original query.
    context (List[str]): The context of the query, returned by embedding search.
    llm (Ollama): The Ollama instance.

    Returns:
    A response to the question.
    """
    prompt = build_prompt(query, context)
    response = llm.complete(prompt)
    return response

def main(collection_name: str = "documents_collection", persist_directory: str = ".") -> None:
    # Instantiate Ollama
    llm = Ollama(model="gemma:2b", request_timeout=300.0)
    print("Ollama model instantiated.")

    # We use a simple input loop.
    while True:
        # Get the user's query
        query = input("Query: ")
        if len(query) == 0:
            print("Please enter a question. Ctrl+C to Quit.\n")
            continue
        print("\nThinking using Ollama...\n")

        # Get the response from Ollama
        response = get_LL_response(query, [], llm)
        print(response)
        print("\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query a language model")

    # Parse arguments
    args = parser.parse_args()

    main()


'''





























import json
import argparse
import os
from typing import List
from llama_index.llms.ollama import Ollama
import chromadb
import requests
def build_prompt(query: str, context: List[str]) -> str:
    """
    Builds a prompt for the LLM.

    Args:
    query (str): The original query.
    context (List[str]): The context of the query, returned by embedding search.

    Returns:
    A prompt for the LLM.
    """
    prompt =f"Please ensure that each response is crafted in proper markdown format. \
    Utilize the provided context as your primary source of information when answering the question.\n \
    ALWAYS ANSWER THE QUERY BASED UPON THE CONTEXT PROVIDED PLEASE DON'T USE YOUR EXTRA KNOWLEDGE \n Incorporate relevant details from the context into your response, giving precedence to information found within.\n If the context does not provide sufficient information to answer the question, utilize external resources judiciously to fill in the gaps.\n\n \
    Organize your response into coherent paragraphs, making it easy to read and understand.\n\n \
    Remember to prioritize concise and accurate responses.\n \
    The context is: {context} \
    The question is: {query}\n \
    DISCLAIMER: GIVE ANSWER IN **MARKDOWN LANGUAGE**"
    return prompt

def get_LL_response(query: str, context: List[str], llm: Ollama) -> str:
    """
    Queries the LLM to get a response to the question.

    Args:
    query (str): The original query.
    context (List[str]): The context of the query, returned by embedding search.
    llm (Ollama): The Ollama instance.

    Returns:
    A response to the question.
    """
    # prompt = build_prompt(query, context)
    # url = 'http://localhost:11434/api/generate'
    # data = {
    # "model": "llama2",
    # "prompt": prompt,
    # "stream": True
    # }
    # response2 = requests.post(url, json=data)
    # print(response2.json())



    def stream_response(url, data):
        response = requests.post(url, json=data, stream=True)
        for chunk in response.iter_content(chunk_size=None):
            yield chunk

    def get_continuous_response(query, context):
        prompt = build_prompt(query, context)
        url = 'http://localhost:11434/api/generate'
        data = {
        "model": "llama2",
        "prompt": prompt,
        "stream": True
        }
        for chunk in stream_response(url, data):
            yield chunk

    for chunk in get_continuous_response(query, context):
        # print(chunk)
        response_string = chunk.decode('utf-8')
        response_dict = json.loads(response_string)
        print(response_dict['response'], end='', flush=True)

  


        





    
    #prompt = build_prompt(query, context)
    #response = llm.complete(prompt)
    # return ((response2.json())['response'])

def main(query, collection_name: str = "documents_collection", persist_directory: str = ".") -> None:

    # Instantiate Ollama
    llm = Ollama(model="BhilaiGPT_2.0", request_timeout=300.0)
    print("Ollama model instantiated.")

    # Instantiate a persistent chroma client in the persist_directory.
    # This will automatically load any previously saved collections.
    # Learn more at docs.trychroma.com
    client = chromadb.PersistentClient(path=persist_directory)

    # Get the collection.
    collection = client.get_collection(name=collection_name)

    results = collection.query(
            query_texts=[query], n_results=10, include=["documents", "metadatas"]
        )

    sources = "\n".join(
            [
                f"{result['filename']}: line {result['line_number']}"
                for result in results["metadatas"][0]  # type: ignore
            ]
        )

        # Get the response from Ollama

        
    response = get_LL_response(query, results["documents"][0], llm)

    # We use a simple input loop.
    # while True:
        # Get the user's query
        query = input("Query: ")
        if len(query) == 0:
            print("Please enter a question. Ctrl+C to Quit.\n")
            continue
        print(f"\nThinking using ...\n")

        # Query the collection to get the 5 most relevant results
        results = collection.query(
            query_texts=[query], n_results=10, include=["documents", "metadatas"]
        )

        sources = "\n".join(
            [
                f"{result['filename']}: line {result['line_number']}"
                for result in results["metadatas"][0]  # type: ignore
            ]
        )

        # Get the response from Ollama

        
        response = get_LL_response(query, results["documents"][0], llm)
        print(response)

def mainModel(query):
    # print('hello')
    parser = argparse.ArgumentParser(description="Query a language model")

    parser.add_argument(
        "--persist_directory",
        type=str,
        default="chroma_storage",
        help="The directory where you want to store the Chroma collection",
    )
    parser.add_argument(
        "--collection_name",
        type=str,
        default="documents_collection",
        help="The name of the Chroma collection",
    )

    # Parse arguments
    args = parser.parse_args()

    main(
        query,
        collection_name=args.collection_name,
        persist_directory=args.persist_directory,
    
    )
