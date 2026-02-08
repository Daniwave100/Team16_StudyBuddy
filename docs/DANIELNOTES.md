User uploads files → chunks + embeddings → stored in vector store
                                                    ↓
Frontend sends request → Route → Orchestrator → queries vector store
                                                    ↓
                                        retrieves relevant chunks
                                                    ↓
                                        injects into system prompt
                                                    ↓
                                        calls OpenAI → response


                                