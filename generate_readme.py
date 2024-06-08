import os
import time
from openai import OpenAI, OpenAIError  # ここで OpenAIError をインポート

client = OpenAI(api_key='自分のメモ帳を確認しなさい')

# ディレクトリ内のすべてのファイルを再帰的に読み込む関数
def read_all_files(directory):
    files_content = {}
    for root, dirs, files in os.walk(directory):
        # .gitディレクトリをスキップ
        dirs[:] = [d for d in dirs if d != '.git']
        for file in files:
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                try:
                    files_content[file_path] = f.read()
                except Exception as e:
                    print(f"Could not read file {file_path}: {e}")
    return files_content

# ファイル内容をGPTモデルで解析する関数
def analyze_with_gpt(file_contents):
    results = {}
    for file_path, content in file_contents.items():
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": f"Analyze the following code/file:\n\n{content}"}
                ],
                max_tokens=1500,
                temperature=0.5
            )
            results[file_path] = response.choices[0].message.content.strip()
        except OpenAIError as e:  # 正しい例外クラスを使用
            if e.code == 'insufficient_quota':
                print(f"Insufficient quota for {file_path}. Retrying after some time...")
                time.sleep(60)  # 1分待機してリトライ
                return analyze_with_gpt({file_path: content})  # 特定のファイルのみリトライ
            else:
                results[file_path] = f"Error analyzing file: {e}"
    return results

# メイン処理
if __name__ == "__main__":
    repository_path = '.'  # クローンしたリポジトリのパスを指定
    file_contents = read_all_files(repository_path)
    analysis_results = analyze_with_gpt(file_contents)

    # 結果を出力
    for file_path, analysis in analysis_results.items():
        print(f"Analysis for {file_path}:\n{analysis}\n{'='*60}\n")
