from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "with logo"
OUTPUT_ROOT = ROOT / "server" / "generated_trailers"
MOVIE_OUTPUT_ROOT = ROOT / "server" / "generated_movies"
INTRO_LOGO = ROOT / "video data" / "AI logo video 30 sec tv size.mp4"
INTRO_DURATION_SECONDS = 6

MOVIES = [
    (
        "H2O - Just Add Water",
        "H2O – Just Add Water with logo.mp4",
        "h2o-just-add-water-trailer.mp4",
        "h2o-just-add-water-movie.mp4",
    ),
    (
        "Ladyas Vendetta",
        "ladyas vendetta with logo.mp4",
        "ladyas-vendetta-trailer.mp4",
        "ladyas-vendetta-movie.mp4",
    ),
    (
        "Morkut Drama",
        "morkut drama with logo.mp4",
        "morkut-drama-trailer.mp4",
        "morkut-drama-movie.mp4",
    ),
]


def run(command: list[str]) -> str:
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def duration_seconds(path: Path) -> float:
    output = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "json",
            str(path),
        ]
    )
    payload = json.loads(output)
    return float(payload["format"]["duration"])


def segment_starts(duration: float) -> list[float]:
    if duration < 50:
        return [0]
    return [
        max(0, duration * 0.08),
        max(0, duration * 0.42),
        max(0, duration * 0.72),
    ]


def render_concat(segments: list[tuple[Path, float, float | None]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()

    inputs: list[str] = []
    filter_parts: list[str] = []
    concat_inputs: list[str] = []

    for index, (source, start, segment_duration) in enumerate(segments):
        inputs.extend(["-ss", f"{start:.3f}"])
        if segment_duration is not None:
            inputs.extend(["-t", f"{segment_duration:.3f}"])
        inputs.extend(["-i", str(source)])
        filter_parts.append(
            f"[{index}:v]scale=1280:-2,fps=30,format=yuv420p,setpts=PTS-STARTPTS[v{index}]"
        )
        filter_parts.append(f"[{index}:a]aformat=sample_rates=48000:channel_layouts=stereo,asetpts=PTS-STARTPTS[a{index}]")
        concat_inputs.append(f"[v{index}][a{index}]")

    filter_complex = ";".join(filter_parts + [f"{''.join(concat_inputs)}concat=n={len(segments)}:v=1:a=1[v][a]"])

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            *inputs,
            "-filter_complex",
            filter_complex,
            "-map",
            "[v]",
            "-map",
            "[a]",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "24",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-movflags",
            "+faststart",
            str(output),
        ],
        check=True,
    )


def generate_trailer(source: Path, output: Path) -> None:
    duration = duration_seconds(source)
    starts = segment_starts(duration)
    segment_duration = 12 if len(starts) > 1 else min(36, duration)
    segments = [(INTRO_LOGO, 0, INTRO_DURATION_SECONDS)]
    segments.extend((source, start, segment_duration) for start in starts)
    render_concat(segments, output)


def generate_movie(source: Path, output: Path) -> None:
    render_concat([(INTRO_LOGO, 0, INTRO_DURATION_SECONDS), (source, 0, None)], output)


def main() -> None:
    if not INTRO_LOGO.is_file():
        raise FileNotFoundError(f"Missing intro logo: {INTRO_LOGO}")

    for title, file_name, trailer_output_name, movie_output_name in MOVIES:
        source = SOURCE_ROOT / file_name
        trailer_output = OUTPUT_ROOT / trailer_output_name
        movie_output = MOVIE_OUTPUT_ROOT / movie_output_name
        if not source.is_file():
            raise FileNotFoundError(f"Missing source for {title}: {source}")
        print(f"Generating trailer: {title}")
        generate_trailer(source, trailer_output)
        print(f"Saved: {trailer_output}")
        print(f"Generating movie with logo: {title}")
        generate_movie(source, movie_output)
        print(f"Saved: {movie_output}")


if __name__ == "__main__":
    main()
